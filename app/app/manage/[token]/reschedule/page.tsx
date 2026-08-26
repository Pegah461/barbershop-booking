import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock } from "lucide-react"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { getBookingLockReason } from "@/lib/booking-cutoff"
import { Button } from "@/components/ui/button"
import { RescheduleView } from "./RescheduleView"

export const metadata: Metadata = {
  title: "Reschedule",
  // Reached only through a private token link — never index, never leak the
  // token through a referrer.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

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
      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-[560px] px-5 py-12 sm:px-7 sm:py-16">
          <p className="data-label text-talc-deep">Rescheduling</p>
          <h1 className="mt-3 text-[clamp(34px,7vw,52px)]">too late to move it</h1>

          <div className="mt-8 flex items-start gap-3 rounded-xl bg-card p-6">
            <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-talc-deep" />
            <p className="text-[15px] leading-relaxed text-talc-deep">{lockReason}</p>
          </div>

          <Button asChild variant="outline" className="mt-6">
            <Link href={`/manage/${token}`}>back to your booking</Link>
          </Button>
        </div>
      </main>
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
