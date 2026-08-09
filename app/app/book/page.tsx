import { db } from "@/lib/prisma"
import { BookingWizard } from "./BookingWizard"

// Services/addons are admin-configurable and must always reflect current
// data — this page must never be statically frozen at build time.
export const dynamic = "force-dynamic"

export default async function BookPage() {
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

  return (
    <div className="min-h-screen bg-muted/20">
      <BookingWizard services={services} addons={addons} />
    </div>
  )
}
