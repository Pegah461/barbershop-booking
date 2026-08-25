import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { CURRENCY } from "@/lib/shop"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cents → "SBD $20.00". Prices are stored in cents everywhere.
 * The currency is named explicitly — the shop is in Honiara and prices are
 * Solomon Islands dollars, which a bare "$" leaves ambiguous.
 */
export function formatMoney(cents: number) {
  return `${CURRENCY} $${(cents / 100).toFixed(2)}`
}

/** Minutes → "45 mins", "1 hr", "1 hr 30 mins". Display only. */
export function formatDuration(mins: number) {
  const hours = Math.floor(mins / 60)
  const rest = mins % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} hr${hours === 1 ? "" : "s"}`)
  if (rest > 0) parts.push(`${rest} min${rest === 1 ? "" : "s"}`)

  return parts.join(" ") || "0 mins"
}
