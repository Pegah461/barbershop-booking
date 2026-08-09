import { notFound } from "next/navigation"
import Link from "next/link"
import { formatInTimeZone } from "date-fns-tz"
import { CheckCircle2 } from "lucide-react"
import { db } from "@/lib/prisma"
import { SHOP_TZ } from "@/lib/timezone"

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params
  const booking = await db.booking.findUnique({
    where:   { reference },
    include: { addons: true },
  })
  if (!booking) notFound()

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
      <div>
        <h1 className="text-2xl font-bold">Booking confirmed</h1>
        <p className="mt-1 text-muted-foreground">
          Reference <span className="font-mono font-medium">{booking.reference}</span>
        </p>
      </div>

      <div className="space-y-2 rounded-lg border bg-white p-6 text-left text-sm">
        <Row label="Service" value={booking.serviceName} />
        {booking.addons.length > 0 && (
          <Row label="Add-ons" value={booking.addons.map((a) => a.addonName).join(", ")} />
        )}
        <Row label="When" value={formatInTimeZone(booking.startsAt, SHOP_TZ, "EEEE, MMM d 'at' h:mm a")} />
        <Row label="Duration" value={`${booking.durationMins} min`} />
        <Row label="Total" value={`$${(booking.totalCents / 100).toFixed(2)}`} />
      </div>

      <p className="text-sm text-muted-foreground">
        A confirmation has been sent to the email you provided. See you then!
      </p>

      <Link href="/" className="inline-block text-sm text-primary hover:underline">
        ← Back to home
      </Link>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
