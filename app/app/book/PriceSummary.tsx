import { formatMoney } from "@/lib/utils"
import type { ServiceOption, AddonOption } from "./types"

/**
 * The running selection band that sits under the step strip: what you've
 * picked on the left, duration and total on the right.
 */
export function PriceSummary({
  service, addons, totalCents, durationMins, whenLabel,
}: {
  service: ServiceOption | null
  addons: AddonOption[]
  totalCents: number
  durationMins: number
  whenLabel?: string
}) {
  const selection = service
    ? [service.name, ...addons.map((a) => a.name)].join(" + ") +
      ` · ${whenLabel ?? "no time picked"}`
    : "Select a service to see pricing."

  return (
    <div className="flex items-center gap-4 border border-border bg-brand/[0.07] px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="kicker">Selection</div>
        <div className="truncate text-sm">{selection}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="kicker">{durationMins} min</div>
        <div className="font-heading text-[26px] font-semibold leading-none">
          {formatMoney(totalCents)}
        </div>
      </div>
    </div>
  )
}
