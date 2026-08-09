"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepIndicator({
  labels, current, maxReached, onSelect,
}: {
  labels: string[]; current: number; maxReached: number; onSelect: (step: number) => void
}) {
  return (
    <ol className="flex items-center">
      {labels.map((label, i) => {
        const step = i + 1
        const reachable = step <= maxReached
        const active = step === current
        const done = step < current

        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onSelect(step)}
              className="flex flex-col items-center gap-1 disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  active && "border-primary bg-primary text-primary-foreground",
                  done && !active && "border-primary text-primary",
                  !active && !done && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </span>
              <span
                className={cn(
                  "hidden text-[11px] sm:block",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </button>
            {step < labels.length && <span className="mx-2 h-px flex-1 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}
