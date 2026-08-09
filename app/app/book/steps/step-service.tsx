"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ServiceOption } from "../types"

export function StepService({
  services, selectedId, onSelect,
}: {
  services: ServiceOption[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Choose a service</h2>

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
                "relative rounded-lg border p-4 text-left transition-colors hover:border-primary/60",
                selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
              )}
            >
              {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
              <p className="pr-6 font-medium">{s.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.durationMins} min</p>
              <p className="mt-2 text-sm font-semibold">${(s.priceCents / 100).toFixed(2)}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
