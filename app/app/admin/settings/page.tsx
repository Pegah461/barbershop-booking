import { db } from "@/lib/prisma"
import { SettingsForm } from "./SettingsForm"

export default async function SettingsPage() {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } })
  const s = settings ?? {
    shopName: "Barbershop", shopPhone: "", shopEmail: "",
    slotIntervalMins: 15, bufferMins: 0, minLeadTimeHours: 2,
    maxBookAheadDays: 30, cancelCutoffHours: 24,
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure shop details and booking rules.</p>
      </div>
      <SettingsForm settings={s} />
    </div>
  )
}
