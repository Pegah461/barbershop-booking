import { NextResponse } from "next/server"
import { formatInTimeZone } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { computePricing } from "@/lib/pricing"
import { getAvailableSlots, SHOP_TZ } from "@/lib/availability"
import { CreateBookingSchema } from "@/lib/validations/booking"
import { generateReference, generateManageToken } from "@/lib/booking-code"
import { SLOT_TAKEN_MESSAGE, SlotTakenError, isUniqueViolation, isSlotConstraintViolation } from "@/lib/booking-conflict"
import { sendBookingConfirmationEmail, sendAdminNewBookingEmail } from "@/lib/email/booking-emails"

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = CreateBookingSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid booking data" },
      { status: 400 },
    )
  }
  const { serviceId, addonIds, startsAt, customerName, customerPhone, customerEmail, customerComments } = parsed.data

  const startDate = new Date(startsAt)

  // Never trust client-supplied price/duration — recompute from the DB.
  let pricing: Awaited<ReturnType<typeof computePricing>>
  try {
    pricing = await computePricing({ serviceId, addonIds })
  } catch {
    return NextResponse.json({ error: "That service is no longer available." }, { status: 400 })
  }

  const endDate = new Date(startDate.getTime() + pricing.durationMins * 60_000)

  // Full re-validation against current hours/closures/lead-time/other bookings —
  // the wizard's slot list may be stale by the time the customer submits.
  const dateStr = formatInTimeZone(startDate, SHOP_TZ, "yyyy-MM-dd")
  const freshSlots = await getAvailableSlots({ date: dateStr, serviceId, addonIds })
  if (!freshSlots.includes(startDate.toISOString())) {
    return NextResponse.json({ error: SLOT_TAKEN_MESSAGE }, { status: 409 })
  }

  // Reference codes are 4 random hex chars (65k combinations) — retry a
  // handful of times on the astronomically unlikely collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const booking = await db.$transaction(async (tx) => {
        // Closes the TOCTOU gap between the availability check above and this
        // insert: re-verify inside the transaction that nothing else grabbed
        // the slot in the meantime. The booking_no_overlap EXCLUDE constraint
        // is the final authoritative guard beneath this.
        const overlap = await tx.booking.findFirst({
          where: {
            status:   { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
            startsAt: { lt: endDate },
            endsAt:   { gt: startDate },
          },
          select: { id: true },
        })
        if (overlap) throw new SlotTakenError()

        return tx.booking.create({
          data: {
            reference:           generateReference(),
            manageToken:         generateManageToken(),
            serviceId,
            serviceName:         pricing.service.name,
            servicePriceCents:   pricing.service.priceCents,
            serviceDurationMins: pricing.service.durationMins,
            status:              BookingStatus.PENDING,
            startsAt:            startDate,
            endsAt:              endDate,
            durationMins:        pricing.durationMins,
            totalCents:          pricing.totalCents,
            customerName,
            customerPhone,
            customerEmail,
            customerComments:    customerComments || null,
            addons: {
              create: pricing.addons.map((a) => ({
                addonId:           a.id,
                addonName:         a.name,
                addonPriceCents:   a.priceCents,
                addonDurationMins: a.extraDurationMins,
              })),
            },
          },
        })
      })

      // Best-effort — the booking is already committed, so an email outage
      // must not fail the response the customer is waiting on.
      try {
        await Promise.all([
          sendBookingConfirmationEmail(booking.id),
          sendAdminNewBookingEmail(booking.id),
        ])
      } catch (e) {
        console.error("Failed to send booking emails", e)
      }

      return NextResponse.json({ reference: booking.reference }, { status: 201 })
    } catch (e) {
      if (e instanceof SlotTakenError || isSlotConstraintViolation(e)) {
        return NextResponse.json({ error: SLOT_TAKEN_MESSAGE }, { status: 409 })
      }
      if (isUniqueViolation(e)) continue // reference/manageToken collision — retry with fresh values

      console.error("Failed to create booking", e)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
}
