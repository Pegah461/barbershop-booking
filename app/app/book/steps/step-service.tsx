"use client"

import { Check } from "lucide-react"
import { cn, formatMoney } from "@/lib/utils"
import type { ServiceOption } from "../types"

export function StepService({
  services, selectedId, onSelect,
}: {
  services: ServiceOption[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <div>
      <h4 className="mb-3.5">Choose a service</h4>

      {services.length === 0 && (
        <p className="text-sm text-muted-foreground">No services are available right now.</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((s) => {
          const selected = s.id === selectedId
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-pressed={selected}
              className={cn(
                "relative border p-3.5 text-left transition-colors",
                selected
                  ? "border-brand bg-brand/[0.08]"
                  : "border-border hover:border-foreground/40",
              )}
            >
              {selected && <Check className="absolute right-3 top-3 h-[15px] w-[15px] text-brand" />}
              <div className="pr-6 font-heading text-xl font-semibold">{s.name}</div>
              <div className="text-xs text-foreground/55">{s.durationMins} min</div>
              <div className="mt-1.5 font-heading text-[17px] font-semibold">
                {formatMoney(s.priceCents)}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
