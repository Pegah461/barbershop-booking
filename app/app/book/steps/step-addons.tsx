"use client"

import { Check } from "lucide-react"
import { cn, formatDuration, formatMoney } from "@/lib/utils"
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
      <h2 className="text-[26px]">any extras?</h2>
      <p className="mt-2 text-[15px] text-talc-deep">
        Optional. Each one adds time to your appointment, and the calendar books
        the full length.
      </p>

      {addons.length === 0 && (
        <p className="mt-6 text-[15px] text-talc-deep">
          No extras listed right now — ask in the chair.
        </p>
      )}

      <div className="mt-6 space-y-3">
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
                "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                on
                  ? "border-barbicide-ink bg-barbicide/[0.08]"
                  : "border-nape/15 bg-strip hover:border-nape/30",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[19px] font-bold lowercase leading-tight text-nape">
                  {a.name}
                </span>
                <span className="mt-1 block font-mono text-[13px] tabular-nums text-talc-deep">
                  +{formatDuration(a.extraDurationMins)}
                  <span aria-hidden className="mx-2">·</span>
                  <span className="font-medium text-nape">+{formatMoney(a.priceCents)}</span>
                </span>
              </span>

              <span
                aria-hidden
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                  on ? "bg-barbicide text-nape" : "border border-nape/25",
                )}
              >
                {on && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
