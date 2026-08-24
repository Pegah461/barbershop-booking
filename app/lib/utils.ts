import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Cents → "$20.00". Prices are stored in cents everywhere. */
export function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}
