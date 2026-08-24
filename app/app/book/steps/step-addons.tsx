"use client"

import { cn, formatMoney } from "@/lib/utils"
import type { AddonOption } from "../types"

export function StepAddons({
  addons, selectedIds, onChange,
}: {
  addons: AddonOption[]; selectedIds: string[]; onChange: (ids: string[]) => void
}) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id],
    )
  }

  return (
    <div>
      <h4 className="mb-0.5">Add-ons</h4>
      <p className="mb-3 text-[13px] text-foreground/55">Optional — select any extras.</p>

      {addons.length === 0 && (
        <p className="text-sm text-muted-foreground">No add-ons available.</p>
      )}

      <div className="grid gap-2.5">
        {addons.map((a) => {
          const on = selectedIds.includes(a.id)
          return (
            <button
              key={a.id}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => toggle(a.id)}
              className={cn(
                "flex items-center justify-between gap-4 border px-3.5 py-3 text-left transition-colors",
                on ? "border-brand bg-brand/[0.08]" : "border-border hover:border-foreground/40",
              )}
            >
              <span>
                <span className="block font-heading text-lg font-semibold">{a.name}</span>
                <span className="text-xs text-foreground/55">
                  +{a.extraDurationMins} min · {formatMoney(a.priceCents)}
                </span>
              </span>

              {/* Square wireframe toggle — the system has no pills. */}
              <span
                aria-hidden
                className={cn(
                  "relative block h-[22px] w-10 shrink-0 border transition-colors",
                  on ? "border-brand bg-brand" : "border-border bg-transparent",
                )}
              >
                <span
                  className={cn(
                    "absolute left-0.5 top-0.5 h-4 w-4 transition-transform",
                    on ? "translate-x-[18px] bg-background" : "bg-foreground/40",
                  )}
                />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
