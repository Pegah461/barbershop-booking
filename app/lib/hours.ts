/**
 * Presentation helpers for the `BusinessHours` rows. Display only — the
 * availability engine reads the same rows directly and is unaffected by
 * anything here.
 */

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

export type HoursRow = {
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
  breakStart?: string | null
  breakEnd?: string | null
}

/** "09:00" → "9am", "13:30" → "1:30pm". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number)
  const suffix = h >= 12 ? "pm" : "am"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour12}${suffix}` : `${hour12}:${String(m).padStart(2, "0")}${suffix}`
}

/**
 * One row per weekday, Monday first — the order the shop's week actually runs
 * in, rather than the DB's Sunday-indexed storage order.
 */
export function weekRows(hours: HoursRow[]): {
  day: string
  open: boolean
  label: string
}[] {
  const order = [1, 2, 3, 4, 5, 6, 0]

  return order.map((dow) => {
    const row = hours.find((h) => h.dayOfWeek === dow)
    const open = row?.isOpen ?? false
    return {
      day: DAY_NAMES[dow],
      open,
      label: open && row ? `${formatTime(row.openTime)} – ${formatTime(row.closeTime)}` : "Closed",
    }
  })
}

/** "Mon–Sat" style summary of the open days, collapsing a contiguous run. */
export function openDaysSummary(hours: HoursRow[]): string {
  const open = hours.filter((h) => h.isOpen).sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  if (open.length === 0) return "By appointment"

  const short = (dow: number) => DAY_NAMES[dow].slice(0, 3)
  const contiguous = open.every((h, i) => i === 0 || h.dayOfWeek === open[i - 1].dayOfWeek + 1)

  if (contiguous && open.length > 1) {
    return `${short(open[0].dayOfWeek)}–${short(open[open.length - 1].dayOfWeek)}`
  }
  return open.map((h) => short(h.dayOfWeek)).join(", ")
}
