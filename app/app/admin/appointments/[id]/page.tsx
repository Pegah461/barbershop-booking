import { notFound } from "next/navigation"
import Link from "next/link"
import { formatInTimeZone } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { SHOP_TZ } from "@/lib/availability"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AppointmentActions } from "./AppointmentActions"

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", CONFIRMED: "default",
  CANCELLED: "destructive", COMPLETED: "secondary", NO_SHOW: "secondary",
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await db.booking.findUnique({
    where: { id },
    include: { addons: true },
  })
  if (!booking) notFound()

  const terminal = ["COMPLETED", "NO_SHOW", "CANCELLED"].includes(booking.status)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/appointments" className="text-sm text-muted-foreground hover:underline">← Appointments</Link>
          <h1 className="text-2xl font-bold mt-1">
            Booking <span className="font-mono">{booking.reference}</span>
          </h1>
        </div>
        <Badge variant={STATUS_COLORS[booking.status] ?? "outline"} className="text-sm">
          {booking.status}
        </Badge>
      </div>

      <div className="rounded-lg border bg-white divide-y">
        <Section title="Customer">
          <Row label="Name"  value={booking.customerName} />
          <Row label="Phone" value={booking.customerPhone} />
          <Row label="Email" value={booking.customerEmail} />
          {booking.customerComments && <Row label="Notes" value={booking.customerComments} />}
        </Section>

        <Section title="Appointment">
          <Row label="Start"    value={formatInTimeZone(booking.startsAt, SHOP_TZ, "EEEE, MMM d yyyy 'at' h:mm a")} />
          <Row label="Duration" value={`${booking.durationMins} minutes`} />
          <Row label="Service"  value={`${booking.serviceName} — $${(booking.servicePriceCents / 100).toFixed(2)}`} />
          {booking.addons.length > 0 && (
            <Row label="Addons" value={booking.addons.map((a) => `${a.addonName} ($${(a.addonPriceCents / 100).toFixed(2)})`).join(", ")} />
          )}
          <Row label="Total" value={`$${(booking.totalCents / 100).toFixed(2)}`} bold />
        </Section>

        <Section title="System">
          <Row label="Manage token" value={booking.manageToken} mono />
          <Row label="Created"      value={formatInTimeZone(booking.createdAt, SHOP_TZ, "MMM d yyyy, h:mm a")} />
          {booking.cancelledAt   && <Row label="Cancelled"    value={formatInTimeZone(booking.cancelledAt,   SHOP_TZ, "MMM d yyyy, h:mm a")} />}
          {booking.rescheduledAt && <Row label="Rescheduled"  value={formatInTimeZone(booking.rescheduledAt, SHOP_TZ, "MMM d yyyy, h:mm a")} />}
        </Section>
      </div>

      {!terminal && (
        <div className="flex gap-2">
          <AppointmentActions id={id} />
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right break-all ${bold ? "font-semibold" : ""} ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
