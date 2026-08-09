import type { ServiceOption, AddonOption } from "./types"

export function PriceSummary({
  service, addons, totalCents, durationMins,
}: {
  service: ServiceOption | null; addons: AddonOption[]; totalCents: number; durationMins: number
}) {
  if (!service) {
    return (
      <div className="sticky top-0 z-10 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Select a service to see pricing.
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium">
          {service.name}
          {addons.length > 0 && ` + ${addons.length} add-on${addons.length > 1 ? "s" : ""}`}
        </p>
        <p className="text-sm text-muted-foreground">{durationMins} min</p>
      </div>
      <p className="text-lg font-bold">${(totalCents / 100).toFixed(2)}</p>
    </div>
  )
}
