import crypto from "node:crypto"

/** Short human-readable reference shown to the customer, e.g. "BRB-4F2A". */
export function generateReference(): string {
  return `BRB-${crypto.randomBytes(2).toString("hex").toUpperCase()}`
}

/** 32-byte hex token emailed to the customer to authenticate the manage-booking page. */
export function generateManageToken(): string {
  return crypto.randomBytes(32).toString("hex")
}
