"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { SHOP_TZ } from "@/lib/timezone"
import { cn } from "@/lib/utils"

// The calendar grid operates on the browser's local calendar-date fields —
// it never needs to know about SHOP_TZ, since a "day" here is just an
// identity (2026-08-10), not an instant. Conversion to/from an absolute UTC
// instant only happens for the fetched slot times themselves (below).
function dateStrToLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}
function localDateToDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function StepDatetime({
  serviceId, addonIds, date, startsAt, notice, onDateChange, onSlotChange,
  slotsEndpoint = "/api/availability/slots",
}: {
  serviceId: string
  addonIds: string[]
  date: string | null
  startsAt: string | null
  notice?: string
  onDateChange: (date: string) => void
  onSlotChange: (startsAt: string) => void
  /** Override the slots fetch endpoint — e.g. a token-scoped route for rescheduling. */
  slotsEndpoint?: string
}) {
  const [month, setMonth] = useState(() => (date ? dateStrToLocalDate(date) : new Date()))
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set())
  // Loading state is derived from whether the last *completed* fetch matches
  // what's currently requested, rather than toggled imperatively — avoids
  // setState calls in the effect body outside of the fetch callback itself.
  const [loadedMonthKey, setLoadedMonthKey] = useState<string | null>(null)
  const loadingDays = loadedMonthKey !== monthKey

  const slotsKey = date ? `${date}|${serviceId}|${addonIds.join(",")}` : null
  const [slots, setSlots] = useState<string[]>([])
  const [loadedSlotsKey, setLoadedSlotsKey] = useState<string | null>(null)
  const loadingSlots = slotsKey !== null && loadedSlotsKey !== slotsKey
  const displaySlots = date ? slots : []

  useEffect(() => {
    let cancelled = false
    fetch(`/api/availability/days?month=${monthKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setAvailableDays(new Set<string>(data.days ?? []))
        setLoadedMonthKey(monthKey)
      })
      .catch(() => { if (!cancelled) setLoadedMonthKey(monthKey) })
    return () => { cancelled = true }
  }, [monthKey])

  useEffect(() => {
    if (!date || !slotsKey) return
    let cancelled = false
    const params = new URLSearchParams({ date, serviceId })
    if (addonIds.length) params.set("addonIds", addonIds.join(","))
    fetch(`${slotsEndpoint}?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setSlots(data.slots ?? [])
        setLoadedSlotsKey(slotsKey)
      })
      .catch(() => { if (!cancelled) setLoadedSlotsKey(slotsKey) })
    return () => { cancelled = true }
    // slotsKey already encodes date/serviceId/addonIds — nothing else to depend on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsKey])

  const slotsNote = !date
    ? "Pick a date to see the times that are still open."
    : loadingSlots
      ? "Checking what's free…"
      : displaySlots.length === 0
        ? "Nothing free on this day — try another date."
        : `${displaySlots.length} time${displaySlots.length === 1 ? "" : "s"} open. Shop local time.`

  return (
    <div>
      <h2 className="text-[26px]">pick a time</h2>
      <p className="mt-2 text-[15px] text-talc-deep">
        Greyed-out dates are closed, full, or too soon to book.
      </p>

      {notice && (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-lg bg-betel/10 p-4 text-[15px] text-betel"
        >
          <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[320px_1fr]">
        <div className="rounded-xl bg-strip p-2">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={date ? dateStrToLocalDate(date) : undefined}
            onSelect={(d) => d && onDateChange(localDateToDateStr(d))}
            disabled={(d) => loadingDays || !availableDays.has(localDateToDateStr(d))}
            className="p-0"
          />
        </div>

        <div>
          <p className="data-label text-talc-deep">
            {date
              ? `Times for ${format(dateStrToLocalDate(date), "EEEE, MMM d")}`
              : "Pick a date first"}
          </p>

          {loadingSlots && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-10 rounded-md bg-nape/10" />
              ))}
            </div>
          )}

          {displaySlots.length > 0 && !loadingSlots && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {displaySlots.map((slot) => {
                const selected = slot === startsAt
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSlotChange(slot)}
                    className={cn(
                      "h-10 rounded-md font-mono text-[13px] tabular-nums transition-colors",
                      selected
                        ? "bg-barbicide font-medium text-nape"
                        : "bg-strip text-nape hover:bg-nape/[0.08]",
                    )}
                  >
                    {formatInTimeZone(new Date(slot), SHOP_TZ, "h:mm a")}
                  </button>
                )
              })}
            </div>
          )}

          <p className="mt-3 text-[14px] text-talc-deep">{slotsNote}</p>
        </div>
      </div>
    </div>
  )
}
