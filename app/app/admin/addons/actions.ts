"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/prisma"
import { AddonFormSchema, type AddonFormValues } from "@/lib/validations/admin"

const PATH = "/admin/addons"

export async function createAddon(values: AddonFormValues): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const p = AddonFormSchema.safeParse(values)
    if (!p.success) return { error: "Invalid data" }
    const { name, priceAmount, extraDurationMins, isActive, sortOrder } = p.data
    await db.addon.create({
      data: { name, priceCents: Math.round(priceAmount * 100), extraDurationMins, isActive, sortOrder },
    })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateAddon(id: string, values: AddonFormValues): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const p = AddonFormSchema.safeParse(values)
    if (!p.success) return { error: "Invalid data" }
    const { name, priceAmount, extraDurationMins, isActive, sortOrder } = p.data
    await db.addon.update({
      where: { id },
      data:  { name, priceCents: Math.round(priceAmount * 100), extraDurationMins, isActive, sortOrder },
    })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteAddon(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db.addon.delete({ where: { id } })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}
