"use client"

import { motion } from "framer-motion"

import { useMotionSafe } from "@/components/motion/MotionProvider"
import { SPRING } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * The wizard's progress, drawn with the same banded device as the homepage's
 * guard rail — laid on its side. The customer recognises the object from the
 * page they came in on.
 *
 * Steps are numbered here because the flow genuinely is a sequence; the
 * homepage's sections are not, so its rail carries no numbers.
 *
 * Presentation only: `current`, `maxReached` and `onSelect` are owned by the
 * wizard and this component never changes them.
 */
export function StepIndicator({
  labels,
  current,
  maxReached,
  onSelect,
}: {
  labels: string[]
  current: number
  maxReached: number
  onSelect: (step: number) => void
}) {
  const motionSafe = useMotionSafe()

  return (
    <nav aria-label="Booking steps">
      <ol className="flex gap-1.5">
        {labels.map((label, i) => {
          const step = i + 1
          const reachable = step <= maxReached
          const active = step === current
          const done = step < current

          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(step)}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${step} of ${labels.length}: ${label}`}
                className="group relative block w-full text-left"
              >
                {/* the band */}
                <span className="relative block h-1.5 overflow-hidden rounded-full bg-nape/10">
                  {active && (
                    <motion.span
                      layoutId="wizard-step-band"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-barbicide"
                      transition={motionSafe ? SPRING : { duration: 0 }}
                    />
                  )}
                  {done && (
                    <span aria-hidden className="absolute inset-0 rounded-full bg-barbicide/35" />
                  )}
                </span>

                <span
                  className={cn(
                    "mt-2 block font-mono text-[11px] tabular-nums transition-colors",
                    active ? "text-nape" : "text-talc-deep",
                    !reachable && "opacity-45",
                  )}
                >
                  <span aria-hidden>{step}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "ml-1.5 hidden sm:inline",
                      active ? "text-nape" : "text-talc-deep",
                    )}
                  >
                    {label}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
