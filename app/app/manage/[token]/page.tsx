import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { formatInTimeZone } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { SHOP_TZ } from "@/lib/timezone"
import { getBookingLockReason } from "@/lib/booking-cutoff"
import { Badge } from "@/components/ui/badge"
import { cn, formatDuration, formatMoney } from "@/lib/utils"
import { ManageBookingActions } from "./ManageBookingActions"

export const metadata: Metadata = {
  title: "Your booking",
  // Reached only through a private token link. It must never be indexed, and
  // the token must not leak through a referrer.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", CONFIRMED: "default",
  CANCELLED: "destructive", COMPLETED: "secondary", NO_SHOW: "secondary",
}

/** What each status means to a customer, in words rather than a code. */
const STATUS_NOTE: Record<string, string> = {
  PENDING: "Booked in. We'll see you at the shop.",
  CONFIRMED: "Confirmed. We'll see you at the shop.",
  COMPLETED: "This one's done. Thanks for coming in.",
  NO_SHOW: "Marked as a no-show.",
}

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const booking = await db.booking.findUnique({
    where:   { manageToken: token },
    include: { addons: true },
  })

  // Invalid or cancelled tokens get the same friendly not-found treatment.
  if (!booking || booking.status === BookingStatus.CANCELLED) notFound()

  const settings = await db.settings.findUnique({ where: { id: "singleton" } })
  const lockReason = getBookingLockReason(booking.status, booking.startsAt, settings?.cancelCutoffHours ?? 24)

  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[680px] px-5 py-12 sm:px-7 sm:py-16">
        <header>
          <p className="data-label text-talc-deep">Your booking</p>
          <h1 className="mt-3 text-[clamp(38px,8vw,60px)]">
            {formatInTimeZone(booking.startsAt, SHOP_TZ, "EEEE")}
            <br />
            {formatInTimeZone(booking.startsAt, SHOP_TZ, "h:mm a").toLowerCase()}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-[17px] text-talc-deep">
              {formatInTimeZone(booking.startsAt, SHOP_TZ, "d MMMM yyyy")}
            </p>
            <Badge variant={STATUS_COLORS[booking.status] ?? "outline"}>{booking.status}</Badge>
          </div>
          {STATUS_NOTE[booking.status] && (
            <p className="mt-3 text-[15px] text-talc-deep">{STATUS_NOTE[booking.status]}</p>
          )}
        </header>

        <div className="mt-10 overflow-hidden rounded-xl bg-nape text-strip">
          <div className="border-b border-strip/10 px-6 py-5">
            <p className="data-label text-talc">Reference</p>
            <p className="mt-2 font-mono text-[26px] font-medium leading-none tracking-[0.02em]">
              {booking.reference}
            </p>
          </div>

          <dl className="divide-y divide-strip/10 px-6">
            <Row label="Service" value={booking.serviceName} />
            {booking.addons.length > 0 && (
              <Row label="Extras" value={booking.addons.map((a) => a.addonName).join(", ")} />
            )}
            <Row label="Takes" value={formatDuration(booking.durationMins)} />
            <Row label="Total" value={formatMoney(booking.totalCents)} strong />
            <Row label="Name" value={booking.customerName} />
            <Row label="Phone" value={booking.customerPhone} />
            <Row label="Email" value={booking.customerEmail} />
          </dl>

          <p className="px-6 py-5 text-[14px] text-talc">Pay at the shop. Cash on the day.</p>
        </div>

        <div className="mt-8">
          <ManageBookingActions token={token} lockReason={lockReason} />
        </div>
      </div>
    </main>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5">
      <dt className="data-label shrink-0 text-talc">{label}</dt>
      <dd
        className={cn(
          "break-words text-right text-[15px]",
          strong && "font-mono text-[18px] font-medium tabular-nums",
        )}
      >
        {value}
      </dd>
    </div>
  )
}
