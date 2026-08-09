/**
 * Availability engine — all slot math is performed in UTC using date-fns-tz.
 * Times stored in the DB are UTC; SHOP_TZ is used only to interpret calendar
 * dates and the HH:mm business-hours strings.
 */
import { addMinutes, isBefore, isAfter } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"

// IANA identifier for Solomon Islands Time (UTC+11, no DST).
// "Pacific/Solomon Islands" is not a valid IANA name — use Pacific/Guadalcanal.
export const SHOP_TZ = "Pacific/Guadalcanal"

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Convert a shop-timezone "YYYY-MM-DD" + "HH:mm" pair to a UTC Date.
 * Uses the Date constructor's LOCAL representation as the "wall clock" input
 * to fromZonedTime, which is timezone-safe across Node environments.
 */
function shopDt(dateStr: string, timeStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number)
  const [h, mi] = timeStr.split(":").map(Number)
  return fromZonedTime(new Date(y, mo - 1, d, h, mi, 0, 0), SHOP_TZ)
}

/**
 * Return [start, end) in UTC for a calendar date expressed in the shop timezone.
 * e.g. "2026-08-10" → [Aug 9 13:00 UTC, Aug 10 13:00 UTC) for UTC+11
 */
function dayBoundsUtc(dateStr: string): { start: Date; end: Date } {
  const [y, mo, d] = dateStr.split("-").map(Number)
  const start = fromZonedTime(new Date(y, mo - 1, d, 0, 0, 0, 0), SHOP_TZ)
  // Date() handles month/day overflow correctly (e.g. day 32 → next month day 1)
  const nd = new Date(y, mo - 1, d + 1)
  const end = fromZonedTime(
    new Date(nd.getFullYear(), nd.getMonth(), nd.getDate(), 0, 0, 0, 0),
    SHOP_TZ,
  )
  return { start, end }
}

/**
 * Return the ISO weekday (0=Sunday … 6=Saturday) for a date string as it
 * appears in the shop timezone (noon is used to avoid any DST-edge issues).
 */
function weekdayInShopTz(dateStr: string): number {
  const [y, mo, d] = dateStr.split("-").map(Number)
  const utcNoon = fromZonedTime(new Date(y, mo - 1, d, 12, 0, 0, 0), SHOP_TZ)
  return toZonedTime(utcNoon, SHOP_TZ).getDay()
}

/** True when half-open intervals [s1,e1) and [s2,e2) share any moment. */
function overlaps(s1: Date, e1: Date, s2: Date, e2: Date): boolean {
  return isBefore(s1, e2) && isBefore(s2, e1)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Return UTC ISO strings for every bookable start time on `date` for the
 * given service + addons combination. Returns [] on any blocking condition.
 *
 * `date` must be a YYYY-MM-DD string interpreted in the shop timezone.
 */
export async function getAvailableSlots({
  date,
  serviceId,
  addonIds = [],
  _now,
}: {
  date: string
  serviceId: string
  addonIds?: string[]
  /** Injectable for tests — defaults to Date.now() in production */
  _now?: Date
}): Promise<string[]> {
  // ── 1. Load settings, service, addons ─────────────────────────────────────
  const [settings, service, addons] = await Promise.all([
    db.settings.findUnique({ where: { id: "singleton" } }),
    db.service.findUnique({ where: { id: serviceId } }),
    addonIds.length
      ? db.addon.findMany({ where: { id: { in: addonIds }, isActive: true } })
      : Promise.resolve([] as Awaited<ReturnType<typeof db.addon.findMany>>),
  ])

  if (!settings || !service || !service.isActive) return []

  // ── 2. Business hours for the weekday ─────────────────────────────────────
  const dayOfWeek = weekdayInShopTz(date)
  const hours = await db.businessHours.findUnique({ where: { dayOfWeek } })
  if (!hours?.isOpen) return []

  // ── 3. Max-advance-window check (date-level, fast exit) ───────────────────
  const { start: dayStartUtc, end: dayEndUtc } = dayBoundsUtc(date)
  const now = _now ?? new Date() // wall-clock — only used for boundary comparisons
  const maxCutoff = addMinutes(now, settings.maxBookAheadDays * 24 * 60)
  if (!isBefore(dayStartUtc, maxCutoff)) return []

  // ── 4. Full-day closure check ─────────────────────────────────────────────
  const fullDayClosure = await db.closure.findFirst({
    where: {
      isAllDay: true,
      startsAt: { lt: dayEndUtc },
      endsAt:   { gt: dayStartUtc },
    },
  })
  if (fullDayClosure) return []

  // ── 5. Required duration: service + addons + buffer ───────────────────────
  const addonMins = addons.reduce((s, a) => s + a.extraDurationMins, 0)
  const requiredMins = service.durationMins + addonMins + settings.bufferMins

  // ── 6. Generate candidate start times (UTC) stepping by slotIntervalMins ──
  const openUtc  = shopDt(date, hours.openTime)
  const closeUtc = shopDt(date, hours.closeTime)
  const candidates: Date[] = []
  let cursor = openUtc
  while (isBefore(cursor, closeUtc)) {
    candidates.push(cursor)
    cursor = addMinutes(cursor, settings.slotIntervalMins)
  }

  // ── 7. Load partial closures and existing bookings in parallel ─────────────
  const [partialClosures, existingBookings] = await Promise.all([
    db.closure.findMany({
      where: {
        isAllDay: false,
        startsAt: { lt: dayEndUtc },
        endsAt:   { gt: dayStartUtc },
      },
    }),
    db.booking.findMany({
      where: {
        status:   { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        startsAt: { gte: dayStartUtc, lt: dayEndUtc },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ])

  // ── 8. Per-candidate filters ──────────────────────────────────────────────
  const leadCutoff = addMinutes(now, settings.minLeadTimeHours * 60)

  const breakStart = hours.breakStart ? shopDt(date, hours.breakStart) : null
  const breakEnd   = hours.breakEnd   ? shopDt(date, hours.breakEnd)   : null

  return candidates
    .filter((slotStart) => {
      const slotEnd = addMinutes(slotStart, requiredMins)

      // Slot must not extend past closing time
      if (isAfter(slotEnd, closeUtc)) return false

      // Slot must clear the minimum lead time
      if (isBefore(slotStart, leadCutoff)) return false

      // Break window
      if (breakStart && breakEnd && overlaps(slotStart, slotEnd, breakStart, breakEnd))
        return false

      // Partial-day closures
      for (const c of partialClosures) {
        if (overlaps(slotStart, slotEnd, c.startsAt, c.endsAt)) return false
      }

      // Existing PENDING / CONFIRMED bookings
      for (const b of existingBookings) {
        if (overlaps(slotStart, slotEnd, b.startsAt, b.endsAt)) return false
      }

      return true
    })
    .map((s) => s.toISOString())
}

/**
 * Return YYYY-MM-DD strings (shop timezone) for every bookable calendar day
 * in the requested month, based on business hours, lead time, and closures.
 * Slot-level availability is NOT checked here (computed on demand).
 */
export async function getAvailableDays({
  year,
  month,
}: {
  year: number
  month: number // 1–12
}): Promise<string[]> {
  const [settings, allHours] = await Promise.all([
    db.settings.findUnique({ where: { id: "singleton" } }),
    db.businessHours.findMany(),
  ])
  if (!settings) return []

  const hoursMap = new Map(allHours.map((h) => [h.dayOfWeek, h]))
  const now = new Date()
  const leadCutoff = addMinutes(now, settings.minLeadTimeHours * 60)
  const maxCutoff  = addMinutes(now, settings.maxBookAheadDays * 24 * 60)

  // Fetch full-day closures for the entire month in one query
  const monthStart = fromZonedTime(new Date(year, month - 1, 1, 0, 0, 0, 0), SHOP_TZ)
  const monthEnd   = fromZonedTime(new Date(year, month,     1, 0, 0, 0, 0), SHOP_TZ)

  const fullDayClosures = await db.closure.findMany({
    where: {
      isAllDay: true,
      startsAt: { lt: monthEnd },
      endsAt:   { gt: monthStart },
    },
  })

  // new Date(year, month, 0) = last day of month (day-0 of month+1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const available: string[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const { start: dayStart, end: dayEnd } = dayBoundsUtc(dateStr)

    // Entire day must not have passed the lead cutoff
    if (!isAfter(dayEnd, leadCutoff)) continue
    // Day must be within the advance booking window
    if (!isBefore(dayStart, maxCutoff)) continue

    // Shop must be open this weekday
    const dow = weekdayInShopTz(dateStr)
    const hrs = hoursMap.get(dow)
    if (!hrs?.isOpen) continue

    // No full-day closure covering this date
    const blocked = fullDayClosures.some(
      (c) => isBefore(c.startsAt, dayEnd) && isBefore(dayStart, c.endsAt),
    )
    if (blocked) continue

    available.push(dateStr)
  }

  return available
}
