import { fromZonedTime, formatInTimeZone } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { SHOP_TZ } from "@/lib/availability"
import { AppointmentsTable } from "./AppointmentsTable"

function shopDateToUtc(dateStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number)
  return fromZonedTime(new Date(y, mo - 1, d, 0, 0, 0, 0), SHOP_TZ)
}

function shopDateEndUtc(dateStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number)
  const nd = new Date(y, mo - 1, d + 1)
  return fromZonedTime(new Date(nd.getFullYear(), nd.getMonth(), nd.getDate(), 0, 0, 0, 0), SHOP_TZ)
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string; sort?: string }>
}) {
  const sp = await searchParams
  const today = formatInTimeZone(new Date(), SHOP_TZ, "yyyy-MM-dd")
  const from   = typeof sp.from   === "string" ? sp.from   : today
  const to     = typeof sp.to     === "string" ? sp.to     : today
  const status = typeof sp.status === "string" ? sp.status : ""
  const sort   = sp.sort === "desc" ? "desc" : "asc"

  const bookings = await db.booking.findMany({
    where: {
      startsAt: { gte: shopDateToUtc(from), lt: shopDateEndUtc(to) },
      ...(status ? { status: status as BookingStatus } : {}),
    },
    orderBy: { startsAt: sort },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <AppointmentsTable bookings={bookings} from={from} to={to} status={status} sort={sort} />
    </div>
  )
}
