import { notFound } from "next/navigation"
import { formatInTimeZone } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { SHOP_TZ } from "@/lib/timezone"
import { getBookingLockReason } from "@/lib/booking-cutoff"
import { Badge } from "@/components/ui/badge"
import { ManageBookingActions } from "./ManageBookingActions"

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", CONFIRMED: "default",
  CANCELLED: "destructive", COMPLETED: "secondary", NO_SHOW: "secondary",
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
    <div className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your booking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference <span className="font-mono">{booking.reference}</span>
          </p>
        </div>
        <Badge variant={STATUS_COLORS[booking.status] ?? "outline"} className="text-sm">
          {booking.status}
        </Badge>
      </div>

      <div className="divide-y rounded-lg border bg-white">
        <Section title="Appointment">
          <Row label="Service" value={booking.serviceName} />
          {booking.addons.length > 0 && (
            <Row label="Add-ons" value={booking.addons.map((a) => a.addonName).join(", ")} />
          )}
          <Row label="When" value={formatInTimeZone(booking.startsAt, SHOP_TZ, "EEEE, MMM d yyyy 'at' h:mm a")} />
          <Row label="Duration" value={`${booking.durationMins} minutes`} />
          <Row label="Total" value={`$${(booking.totalCents / 100).toFixed(2)}`} bold />
        </Section>

        <Section title="Your details">
          <Row label="Name" value={booking.customerName} />
          <Row label="Phone" value={booking.customerPhone} />
          <Row label="Email" value={booking.customerEmail} />
        </Section>
      </div>

      <ManageBookingActions token={token} lockReason={lockReason} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={`text-right break-words ${bold ? "font-semibold" : ""}`}>{value}</span>
    </div>
  )
}
