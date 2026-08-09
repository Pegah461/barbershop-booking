"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/prisma"
import { SettingsFormSchema, type SettingsFormValues } from "@/lib/validations/admin"

export async function saveSettings(values: SettingsFormValues): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const p = SettingsFormSchema.safeParse(values)
    if (!p.success) return { error: "Invalid settings" }
    await db.settings.upsert({
      where:  { id: "singleton" },
      update: p.data,
      create: { id: "singleton", ...p.data },
    })
    revalidatePath("/admin/settings")
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}
