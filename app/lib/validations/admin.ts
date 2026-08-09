import { z } from "zod"

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

// ── Schedule ──────────────────────────────────────────────────────────────────

export const ScheduleRowSchema = z
  .object({
    dayOfWeek:  z.number().int().min(0).max(6),
    isOpen:     z.boolean(),
    openTime:   z.string(),
    closeTime:  z.string(),
    breakStart: z.string().nullable().optional(),
    breakEnd:   z.string().nullable().optional(),
  })
  .superRefine((row, ctx) => {
    if (!row.isOpen) return
    if (!TIME_RE.test(row.openTime))
      ctx.addIssue({ code: "custom", message: "Invalid open time",  path: ["openTime"] })
    if (!TIME_RE.test(row.closeTime))
      ctx.addIssue({ code: "custom", message: "Invalid close time", path: ["closeTime"] })
    if (row.breakStart && !TIME_RE.test(row.breakStart))
      ctx.addIssue({ code: "custom", message: "Invalid break start", path: ["breakStart"] })
    if (row.breakEnd && !TIME_RE.test(row.breakEnd))
      ctx.addIssue({ code: "custom", message: "Invalid break end", path: ["breakEnd"] })
  })

export const ScheduleFormSchema = z.object({ hours: z.array(ScheduleRowSchema).length(7) })
export type ScheduleFormValues = z.infer<typeof ScheduleFormSchema>

// ── Service ───────────────────────────────────────────────────────────────────

export const ServiceFormSchema = z.object({
  name:         z.string().min(1, "Name is required"),
  priceAmount:  z.number().min(0, "Price must be ≥ 0"),
  durationMins: z.number().int().min(1, "Duration must be ≥ 1 minute"),
  isActive:     z.boolean(),
  sortOrder:    z.number().int().min(0),
})
export type ServiceFormValues = z.infer<typeof ServiceFormSchema>

// ── Addon ─────────────────────────────────────────────────────────────────────

export const AddonFormSchema = z.object({
  name:              z.string().min(1, "Name is required"),
  priceAmount:       z.number().min(0, "Price must be ≥ 0"),
  extraDurationMins: z.number().int().min(1, "Extra duration must be ≥ 1 minute"),
  isActive:          z.boolean(),
  sortOrder:         z.number().int().min(0),
})
export type AddonFormValues = z.infer<typeof AddonFormSchema>

// ── Closure ───────────────────────────────────────────────────────────────────

export const ClosureFormSchema = z
  .object({
    date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date required (YYYY-MM-DD)"),
    isAllDay:  z.boolean(),
    startTime: z.string().optional(),
    endTime:   z.string().optional(),
    reason:    z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isAllDay) {
      if (!data.startTime || !TIME_RE.test(data.startTime))
        ctx.addIssue({ code: "custom", message: "Start time required",  path: ["startTime"] })
      if (!data.endTime || !TIME_RE.test(data.endTime))
        ctx.addIssue({ code: "custom", message: "End time required",    path: ["endTime"] })
    }
  })
export type ClosureFormValues = z.infer<typeof ClosureFormSchema>

// ── Settings ──────────────────────────────────────────────────────────────────

export const SettingsFormSchema = z.object({
  shopName:          z.string().min(1, "Shop name is required"),
  shopPhone:         z.string(),
  shopEmail:         z.union([z.string().email(), z.literal("")]),
  slotIntervalMins:  z.number().int().min(5).max(120),
  bufferMins:        z.number().int().min(0),
  minLeadTimeHours:  z.number().int().min(0),
  maxBookAheadDays:  z.number().int().min(1),
  cancelCutoffHours: z.number().int().min(0),
})
export type SettingsFormValues = z.infer<typeof SettingsFormSchema>
