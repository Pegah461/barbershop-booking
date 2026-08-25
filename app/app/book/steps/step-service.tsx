"use client"

import { Check } from "lucide-react"
import { cn, formatDuration, formatMoney } from "@/lib/utils"
import type { ServiceOption } from "../types"

export function StepService({
  services, selectedId, onSelect,
}: {
  services: ServiceOption[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="text-[26px]">choose a service</h2>
      <p className="mt-2 text-[15px] text-talc-deep">
        Extras come next — this is just the cut.
      </p>

      {services.length === 0 && (
        <p className="mt-6 text-[15px] text-talc-deep">
          No services are available right now. Call the shop and we&rsquo;ll sort
          you out.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {services.map((s) => {
          const selected = s.id === selectedId
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                selected
                  ? "border-barbicide-ink bg-barbicide/[0.08]"
                  : "border-nape/15 bg-strip hover:border-nape/30",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[19px] font-bold lowercase leading-tight text-nape">
                  {s.name}
                </span>
                <span className="mt-1 block font-mono text-[13px] tabular-nums text-talc-deep">
                  {formatDuration(s.durationMins)}
                  <span aria-hidden className="mx-2">·</span>
                  <span className="font-medium text-nape">{formatMoney(s.priceCents)}</span>
                </span>
              </span>

              <span
                aria-hidden
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                  selected ? "bg-barbicide text-nape" : "border border-nape/25",
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
