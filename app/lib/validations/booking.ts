import { z } from "zod"

// ── Step 4: customer details ────────────────────────────────────────────────

export const CustomerDetailsSchema = z.object({
  customerName:     z.string().min(1, "Name is required").max(100),
  customerPhone:    z.string().min(1, "Phone is required").max(30),
  customerEmail:    z.string().email("Enter a valid email"),
  customerComments: z.string().max(500, "Keep it under 500 characters").optional(),
})
export type CustomerDetailsValues = z.infer<typeof CustomerDetailsSchema>

// ── POST /api/bookings body ─────────────────────────────────────────────────

export const CreateBookingSchema = CustomerDetailsSchema.extend({
  serviceId: z.string().min(1, "Select a service"),
  addonIds:  z.array(z.string()).default([]),
  // ISO datetime string identifying the selected slot's start (UTC).
  startsAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid start time"),
})
export type CreateBookingValues = z.infer<typeof CreateBookingSchema>
