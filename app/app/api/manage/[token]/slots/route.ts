import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/prisma"
import { getAvailableSlots } from "@/lib/availability"

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
})

/**
 * Token-scoped availability for the reschedule flow. Unlike the public
 * /api/availability/slots route, this derives service/addons/duration from
 * the booking itself (never from client-supplied params) and excludes the
 * booking's own reservation from the overlap check — deliberately NOT
 * exposed as generic params on the public route, which would let any caller
 * probe or exclude arbitrary booking IDs.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ date: searchParams.get("date") })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 })
  }

  const booking = await db.booking.findUnique({
    where:   { manageToken: token },
    include: { addons: true },
  })
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const slots = await getAvailableSlots({
    date:                 parsed.data.date,
    serviceId:            booking.serviceId,
    addonIds:             booking.addons.map((a) => a.addonId),
    durationMinsOverride: booking.durationMins,
    excludeBookingId:     booking.id,
  })

  return NextResponse.json({ slots })
}
