import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { getBookingLockReason } from "@/lib/booking-cutoff"
import { RescheduleView } from "./RescheduleView"

export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const booking = await db.booking.findUnique({
    where:   { manageToken: token },
    include: { addons: true },
  })

  if (!booking || booking.status === BookingStatus.CANCELLED) notFound()

  const settings = await db.settings.findUnique({ where: { id: "singleton" } })
  const lockReason = getBookingLockReason(booking.status, booking.startsAt, settings?.cancelCutoffHours ?? 24)

  if (lockReason) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-12">
        <h1 className="text-2xl font-bold">Reschedule</h1>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          {lockReason}
        </div>
        <Link href={`/manage/${token}`} className="inline-block text-sm text-primary hover:underline">
          ← Back to booking
        </Link>
      </div>
    )
  }

  return (
    <RescheduleView
      token={token}
      serviceId={booking.serviceId}
      addonIds={booking.addons.map((a) => a.addonId)}
      serviceName={booking.serviceName}
    />
  )
}
