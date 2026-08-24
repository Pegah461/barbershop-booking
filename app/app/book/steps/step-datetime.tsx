"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { SHOP_TZ } from "@/lib/timezone"

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
    ? "Pick a date on the left to see the times that are still open."
    : loadingSlots
      ? "Loading available times…"
      : displaySlots.length === 0
        ? "No times available on this day — try another date."
        : `${displaySlots.length} time${displaySlots.length === 1 ? "" : "s"} open. Times are shown in shop local time.`

  return (
    <div>
      <h4 className="mb-3.5">Pick a date &amp; time</h4>

      {notice && (
        <div className="mb-3.5 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {notice}
        </div>
      )}

      <div className="grid items-start gap-6 md:grid-cols-[296px_1fr]">
        <div className="border border-border p-3">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={date ? dateStrToLocalDate(date) : undefined}
            onSelect={(d) => d && onDateChange(localDateToDateStr(d))}
            disabled={(d) => loadingDays || !availableDays.has(localDateToDateStr(d))}
            className="p-0"
          />
          <p className="mt-2.5 text-[11px] text-foreground/50">
            Greyed dates are closed, fully booked, or inside the lead time.
          </p>
        </div>

        <div>
          <div className="kicker mb-2">
            {date
              ? `Times for ${format(dateStrToLocalDate(date), "EEEE, MMM d")}`
              : "Pick a date first"}
          </div>

          {displaySlots.length > 0 && !loadingSlots && (
            <div className="grid grid-cols-3 gap-[7px] sm:grid-cols-4">
              {displaySlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  size="sm"
                  variant={slot === startsAt ? "default" : "outline"}
                  onClick={() => onSlotChange(slot)}
                >
                  {formatInTimeZone(new Date(slot), SHOP_TZ, "h:mm a")}
                </Button>
              ))}
            </div>
          )}

          <p className="mt-3 text-xs text-foreground/55">{slotsNote}</p>
        </div>
      </div>
    </div>
  )
}
