import { BookingStatus } from "@/generated/prisma/enums"

/** True when `startsAt` is less than `cancelCutoffHours` away from `now`. */
export function isWithinCutoff(startsAt: Date, cancelCutoffHours: number, now: Date = new Date()): boolean {
  return startsAt.getTime() - now.getTime() < cancelCutoffHours * 60 * 60 * 1000
}

/**
 * Returns a human-readable reason self-service actions (cancel/reschedule)
 * are disabled for this booking, or null if they're allowed. Shared between
 * the manage page (display) and its Server Actions (enforcement) — never
 * trust the client to have applied this correctly.
 */
export function getBookingLockReason(
  status: BookingStatus,
  startsAt: Date,
  cancelCutoffHours: number,
  now: Date = new Date(),
): string | null {
  if (status === BookingStatus.COMPLETED) return "This appointment has already been completed."
  if (status === BookingStatus.NO_SHOW) return "This appointment was marked as a no-show."
  if (isWithinCutoff(startsAt, cancelCutoffHours, now)) {
    // Name the window so the customer knows what the rule actually was,
    // rather than just being told "too late".
    return `Bookings can be moved or cancelled online up to ${cancelCutoffHours} hour${
      cancelCutoffHours === 1 ? "" : "s"
    } before the appointment. This one is closer than that — please call the shop.`
  }
  return null
}
