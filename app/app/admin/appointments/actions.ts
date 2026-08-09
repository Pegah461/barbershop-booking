"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"

const TERMINAL: BookingStatus[] = [BookingStatus.COMPLETED, BookingStatus.NO_SHOW, BookingStatus.CANCELLED]

async function setStatus(id: string, status: BookingStatus): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const booking = await db.booking.findUnique({ where: { id } })
    if (!booking) return { error: "Booking not found" }
    if (TERMINAL.includes(booking.status)) return { error: "Booking is already in a terminal state" }
    const data: Record<string, unknown> = { status }
    if (status === BookingStatus.CANCELLED) data.cancelledAt = new Date()
    await db.booking.update({ where: { id }, data })
    revalidatePath("/admin/appointments")
    revalidatePath(`/admin/appointments/${id}`)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" }
  }
}

export async function markCompleted(id: string) {
  return setStatus(id, BookingStatus.COMPLETED)
}
export async function markNoShow(id: string) {
  return setStatus(id, BookingStatus.NO_SHOW)
}
export async function markCancelled(id: string) {
  return setStatus(id, BookingStatus.CANCELLED)
}
