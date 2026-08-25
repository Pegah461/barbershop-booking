"use client"

import { motion } from "framer-motion"

import { formatDuration, formatMoney } from "@/lib/utils"
import type { ServiceOption, AddonOption } from "./types"

/**
 * The running selection band that sits under the step strip: what you've
 * picked on the left, duration and total on the right.
 *
 * `layout` is on because this genuinely changes size as add-ons go in and out
 * — the total is the one number the customer is watching.
 */
export function PriceSummary({
  service,
  addons,
  totalCents,
  durationMins,
  whenLabel,
}: {
  service: ServiceOption | null
  addons: AddonOption[]
  totalCents: number
  durationMins: number
  whenLabel?: string
}) {
  const picked = service ? [service.name, ...addons.map((a) => a.name)] : []

  return (
    <motion.div
      layout
      className="flex items-center gap-4 rounded-xl bg-nape px-5 py-4 text-strip"
    >
      <div className="min-w-0 flex-1">
        <p className="data-label text-talc">Your booking</p>

        {service ? (
          <motion.p layout className="mt-1.5 text-[15px] leading-snug">
            {picked.join(" + ")}
            {whenLabel && (
              <>
                <span aria-hidden className="mx-1.5 text-talc">
                  ·
                </span>
                <span className="text-talc">{whenLabel}</span>
              </>
            )}
          </motion.p>
        ) : (
          <p className="mt-1.5 text-[15px] text-talc">
            Pick a service to see the price.
          </p>
        )}
      </div>

      <motion.div layout className="shrink-0 text-right">
        <p className="font-mono text-[12px] tabular-nums text-talc">
          {formatDuration(durationMins)}
        </p>
        <p className="mt-1 font-mono text-[20px] font-medium tabular-nums leading-none">
          {formatMoney(totalCents)}
        </p>
      </motion.div>
    </motion.div>
  )
}
