import { fromZonedTime, formatInTimeZone } from "date-fns-tz"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { db } from "@/lib/prisma"
import { SHOP_TZ } from "@/lib/availability"
import { Badge } from "@/components/ui/badge"

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", CONFIRMED: "default",
  CANCELLED: "destructive", COMPLETED: "secondary", NO_SHOW: "secondary",
}

export default async function AdminDashboard() {
  const todayStr = formatInTimeZone(new Date(), SHOP_TZ, "yyyy-MM-dd")
  const [y, mo, d] = todayStr.split("-").map(Number)

  const dayStart = fromZonedTime(new Date(y, mo - 1, d, 0, 0, 0, 0), SHOP_TZ)
  const dayEnd   = fromZonedTime(new Date(y, mo - 1, d + 1, 0, 0, 0, 0), SHOP_TZ)

  // Week: Mon–Sun in shop timezone
  const weekStart = fromZonedTime(new Date(y, mo - 1, d - ((new Date().getDay() || 7) - 1), 0, 0, 0, 0), SHOP_TZ)
  const weekEnd   = fromZonedTime(new Date(y, mo - 1, d + (7 - (new Date().getDay() || 7)), 23, 59, 59, 0), SHOP_TZ)

  const [todayBookings, weekCount] = await Promise.all([
    db.booking.findMany({
      where: { startsAt: { gte: dayStart, lt: dayEnd }, status: { notIn: ["CANCELLED"] } },
      orderBy: { startsAt: "asc" },
    }),
    db.booking.count({
      where: { startsAt: { gte: weekStart, lte: weekEnd }, status: { notIn: ["CANCELLED"] } },
    }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Today's appointments" value={todayBookings.length.toString()} />
        <StatCard label="This week" value={weekCount.toString()} />
        <StatCard label="Date" value={formatInTimeZone(new Date(), SHOP_TZ, "EEE, MMM d")} />
      </div>

      {/* Today's appointments */}
      <div className="rounded-lg border bg-white divide-y">
        <div className="px-4 py-3 font-semibold text-sm">
          Today — {formatInTimeZone(new Date(), SHOP_TZ, "EEEE, MMMM d")}
        </div>
        {todayBookings.length === 0 && (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">No appointments today.</div>
        )}
        {todayBookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular-nums w-14">
                {formatInTimeZone(b.startsAt, SHOP_TZ, "h:mm a")}
              </span>
              <div>
                <p className="text-sm font-medium">{b.customerName}</p>
                <p className="text-xs text-muted-foreground">{b.serviceName} · {b.durationMins} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_COLORS[b.status] ?? "outline"} className="text-xs">{b.status}</Badge>
              <Link href={`/admin/appointments/${b.id}`} className="text-xs text-muted-foreground hover:underline">View →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
