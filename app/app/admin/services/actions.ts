"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/prisma"
import { ServiceFormSchema, type ServiceFormValues } from "@/lib/validations/admin"

const PATH = "/admin/services"

export async function createService(values: ServiceFormValues): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const p = ServiceFormSchema.safeParse(values)
    if (!p.success) return { error: "Invalid data" }
    const { name, priceAmount, durationMins, isActive, sortOrder } = p.data
    await db.service.create({
      data: { name, priceCents: Math.round(priceAmount * 100), durationMins, isActive, sortOrder },
    })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateService(
  id: string,
  values: ServiceFormValues,
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const p = ServiceFormSchema.safeParse(values)
    if (!p.success) return { error: "Invalid data" }
    const { name, priceAmount, durationMins, isActive, sortOrder } = p.data
    await db.service.update({
      where: { id },
      data:  { name, priceCents: Math.round(priceAmount * 100), durationMins, isActive, sortOrder },
    })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db.service.delete({ where: { id } })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}
