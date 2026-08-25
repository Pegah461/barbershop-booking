import { db } from "@/lib/prisma"
import { BookingWizard } from "./BookingWizard"

// Services/addons are admin-configurable and must always reflect current
// data — this page must never be statically frozen at build time.
export const dynamic = "force-dynamic"

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const { service } = await searchParams
  const requestedService = Array.isArray(service) ? service[0] : service

  const [services, addons] = await Promise.all([
    db.service.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: "asc" },
      select:  { id: true, name: true, priceCents: true, durationMins: true },
    }),
    db.addon.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: "asc" },
      select:  { id: true, name: true, priceCents: true, extraDurationMins: true },
    }),
  ])

  // Only honour a deep link that names a service still on offer.
  const initialServiceId =
    services.some((s) => s.id === requestedService) ? requestedService! : null

  return (
    <main id="main" className="flex-1">
      <BookingWizard services={services} addons={addons} initialServiceId={initialServiceId} />
    </main>
  )
}
