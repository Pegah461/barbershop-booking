import { NextResponse } from "next/server"
import { z } from "zod"
import { getAvailableDays } from "@/lib/availability"

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM"),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ month: searchParams.get("month") })

  if (!parsed.success) {
    return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 })
  }

  const [year, month] = parsed.data.month.split("-").map(Number)
  const days = await getAvailableDays({ year, month })
  return NextResponse.json({ days })
}
