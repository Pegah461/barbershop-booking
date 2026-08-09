import { NextResponse } from "next/server"
import { z } from "zod"
import { getAvailableSlots } from "@/lib/availability"

const querySchema = z.object({
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  serviceId: z.string().min(1),
  addonIds:  z.string().optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    date:      searchParams.get("date"),
    serviceId: searchParams.get("serviceId"),
    addonIds:  searchParams.get("addonIds") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 })
  }

  const addonIds = parsed.data.addonIds
    ? parsed.data.addonIds.split(",").filter(Boolean)
    : []

  const slots = await getAvailableSlots({
    date:      parsed.data.date,
    serviceId: parsed.data.serviceId,
    addonIds,
  })

  return NextResponse.json({ slots })
}
