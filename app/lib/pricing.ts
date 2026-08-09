/**
 * Server-side only. Fetches live service + addon records and computes
 * pricing/duration. Never trust client-supplied prices or durations.
 */
import { db } from "@/lib/prisma"

export async function computePricing({
  serviceId,
  addonIds = [],
}: {
  serviceId: string
  addonIds?: string[]
}) {
  const [service, addons] = await Promise.all([
    db.service.findUnique({ where: { id: serviceId } }),
    addonIds.length
      ? db.addon.findMany({ where: { id: { in: addonIds }, isActive: true } })
      : Promise.resolve([] as Awaited<ReturnType<typeof db.addon.findMany>>),
  ])

  if (!service || !service.isActive) {
    throw new Error(`Service ${serviceId} not found or inactive`)
  }

  const totalCents  = service.priceCents  + addons.reduce((s, a) => s + a.priceCents, 0)
  const durationMins = service.durationMins + addons.reduce((s, a) => s + a.extraDurationMins, 0)

  return { totalCents, durationMins, service, addons }
}
