"use server"

import { revalidatePath } from "next/cache"
import { fromZonedTime } from "date-fns-tz"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/prisma"
import { ClosureFormSchema, type ClosureFormValues } from "@/lib/validations/admin"
import { SHOP_TZ } from "@/lib/availability"

const PATH = "/admin/closures"

export async function createClosure(values: ClosureFormValues): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const p = ClosureFormSchema.safeParse(values)
    if (!p.success) return { error: "Invalid closure data" }

    const { date, isAllDay, startTime, endTime, reason } = p.data
    const [y, mo, d] = date.split("-").map(Number)

    let startsAt: Date, endsAt: Date

    if (isAllDay) {
      startsAt = fromZonedTime(new Date(y, mo - 1, d, 0, 0, 0, 0), SHOP_TZ)
      const nd   = new Date(y, mo - 1, d + 1)
      endsAt     = fromZonedTime(new Date(nd.getFullYear(), nd.getMonth(), nd.getDate(), 0, 0, 0, 0), SHOP_TZ)
    } else {
      const [sh, sm] = startTime!.split(":").map(Number)
      const [eh, em] = endTime!.split(":").map(Number)
      startsAt = fromZonedTime(new Date(y, mo - 1, d, sh, sm, 0, 0), SHOP_TZ)
      endsAt   = fromZonedTime(new Date(y, mo - 1, d, eh, em, 0, 0), SHOP_TZ)
    }

    await db.closure.create({ data: { startsAt, endsAt, isAllDay, reason: reason || null } })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteClosure(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db.closure.delete({ where: { id } })
    revalidatePath(PATH)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}
