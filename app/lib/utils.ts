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
