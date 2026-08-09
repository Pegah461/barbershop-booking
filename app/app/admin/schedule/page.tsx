import { db } from "@/lib/prisma"
import { ScheduleForm } from "./ScheduleForm"

export default async function SchedulePage() {
  // Load all 7 days; fill any missing rows with defaults
  const rows = await db.businessHours.findMany({ orderBy: { dayOfWeek: "asc" } })
  const allDays = Array.from({ length: 7 }, (_, i) => {
    const row = rows.find((r) => r.dayOfWeek === i)
    return {
      dayOfWeek:  i,
      isOpen:     row?.isOpen     ?? (i > 0 && i < 7),
      openTime:   row?.openTime   ?? "09:00",
      closeTime:  row?.closeTime  ?? "18:00",
      breakStart: row?.breakStart ?? null,
      breakEnd:   row?.breakEnd   ?? null,
    }
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Set opening hours for each day of the week.
        </p>
      </div>
      <ScheduleForm initialHours={allDays} />
    </div>
  )
}
