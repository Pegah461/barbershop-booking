"use client"

import { cn } from "@/lib/utils"

/**
 * Industry design system: the wizard's progress is a single hairline-divided
 * strip of segments, not a row of circles — the active step is a solid accent
 * fill, unreached steps are dimmed and inert.
 */
export function StepIndicator({
  labels, current, maxReached, onSelect,
}: {
  labels: string[]; current: number; maxReached: number; onSelect: (step: number) => void
}) {
  return (
    <ol className="flex border border-border">
      {labels.map((label, i) => {
        const step = i + 1
        const reachable = step <= maxReached
        const active = step === current

        return (
          <li key={label} className="flex flex-1 first:[&>button]:border-l-0">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onSelect(step)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex w-full items-center justify-center gap-2 border-l border-border px-1 py-2.5 font-heading text-[13px] font-semibold tracking-[0.04em] transition-colors",
                active ? "bg-brand text-primary-foreground" : "bg-transparent",
                !reachable && "cursor-not-allowed opacity-40",
                reachable && !active && "hover:bg-foreground/[0.06]",
              )}
            >
              <span className="text-[11px] opacity-70">{String(step).padStart(2, "0")}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
