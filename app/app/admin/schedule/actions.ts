"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/prisma"
import { ScheduleFormSchema, type ScheduleFormValues } from "@/lib/validations/admin"

export async function saveSchedule(
  values: ScheduleFormValues,
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const parsed = ScheduleFormSchema.safeParse(values)
    if (!parsed.success) return { error: "Invalid schedule data" }

    await Promise.all(
      parsed.data.hours.map((row) =>
        db.businessHours.upsert({
          where:  { dayOfWeek: row.dayOfWeek },
          update: {
            isOpen:     row.isOpen,
            openTime:   row.openTime,
            closeTime:  row.closeTime,
            breakStart: row.breakStart ?? null,
            breakEnd:   row.breakEnd   ?? null,
          },
          create: {
            dayOfWeek:  row.dayOfWeek,
            isOpen:     row.isOpen,
            openTime:   row.openTime  || "09:00",
            closeTime:  row.closeTime || "18:00",
            breakStart: row.breakStart ?? null,
            breakEnd:   row.breakEnd   ?? null,
          },
        }),
      ),
    )

    revalidatePath("/admin/schedule")
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save" }
  }
}
