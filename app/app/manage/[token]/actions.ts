"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { formatInTimeZone } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { getAvailableSlots, SHOP_TZ } from "@/lib/availability"
import { getBookingLockReason } from "@/lib/booking-cutoff"
import { SLOT_TAKEN_MESSAGE, SlotTakenError, isSlotConstraintViolation } from "@/lib/booking-conflict"
import { sendBookingCancelledEmail, sendBookingRescheduledEmail } from "@/lib/email/booking-emails"

async function loadBookingByToken(token: string) {
  return db.booking.findUnique({
    where:   { manageToken: token },
    include: { addons: true },
  })
}

async function getCancelCutoffHours(): Promise<number> {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } })
  return settings?.cancelCutoffHours ?? 24
}

export async function cancelBooking(token: string): Promise<{ error?: string }> {
  const booking = await loadBookingByToken(token)
  if (!booking) return { error: "Booking not found." }
  if (booking.status === BookingStatus.CANCELLED) return { error: "This booking is already cancelled." }

  const cutoffHours = await getCancelCutoffHours()
  const lockReason = getBookingLockReason(booking.status, booking.startsAt, cutoffHours)
  if (lockReason) return { error: lockReason }

  await db.booking.update({
    where: { id: booking.id },
    data:  { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
  })

  try {
    await sendBookingCancelledEmail(booking.id)
  } catch (e) {
    console.error("Failed to send cancellation email", e)
  }

  // Deliberately NOT revalidating /manage/${token} here: Server Actions
  // auto-refresh the currently-viewed path on revalidation, which would
  // immediately re-fetch this now-cancelled booking and hit the
  // notFound() branch — stomping the client's own "cancelled" success
  // state with a jarring flash to the not-found page. The client already
  // reflects the new status locally; a later fresh visit reads the DB
  // directly regardless.
  revalidatePath("/admin/appointments")
  revalidatePath(`/admin/appointments/${booking.id}`)
  return {}
}

export async function rescheduleBooking(token: string, newStartsAtIso: string): Promise<{ error?: string }> {
  const booking = await loadBookingByToken(token)
  if (!booking) return { error: "Booking not found." }
  if (booking.status === BookingStatus.CANCELLED) return { error: "This booking has been cancelled." }

  const cutoffHours = await getCancelCutoffHours()
  const lockReason = getBookingLockReason(booking.status, booking.startsAt, cutoffHours)
  if (lockReason) return { error: lockReason }

  const newStart = new Date(newStartsAtIso)
  if (Number.isNaN(newStart.getTime())) return { error: "Invalid time" }
  const newEnd = new Date(newStart.getTime() + booking.durationMins * 60_000)

  const addonIds = booking.addons.map((a) => a.addonId)
  const dateStr = formatInTimeZone(newStart, SHOP_TZ, "yyyy-MM-dd")
  const freshSlots = await getAvailableSlots({
    date:                 dateStr,
    serviceId:            booking.serviceId,
    addonIds,
    durationMinsOverride: booking.durationMins,
    excludeBookingId:     booking.id,
  })
  if (!freshSlots.includes(newStart.toISOString())) {
    return { error: SLOT_TAKEN_MESSAGE }
  }

  const previousStartsAt = booking.startsAt

  try {
    await db.$transaction(async (tx) => {
      // Same TOCTOU close as booking creation — re-check inside the
      // transaction immediately before writing the new time.
      const overlap = await tx.booking.findFirst({
        where: {
          id:       { not: booking.id },
          status:   { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          startsAt: { lt: newEnd },
          endsAt:   { gt: newStart },
        },
        select: { id: true },
      })
      if (overlap) throw new SlotTakenError()

      await tx.booking.update({
        where: { id: booking.id },
        data:  { startsAt: newStart, endsAt: newEnd, rescheduledAt: new Date() },
      })
    })
  } catch (e) {
    if (e instanceof SlotTakenError || isSlotConstraintViolation(e)) {
      return { error: SLOT_TAKEN_MESSAGE }
    }
    console.error("Failed to reschedule booking", e)
    return { error: "Failed to reschedule. Please try again." }
  }

  try {
    await sendBookingRescheduledEmail(booking.id, previousStartsAt)
  } catch (e) {
    console.error("Failed to send reschedule email", e)
  }

  revalidatePath(`/manage/${token}`)
  revalidatePath("/admin/appointments")
  revalidatePath(`/admin/appointments/${booking.id}`)
  redirect(`/manage/${token}`)
}
