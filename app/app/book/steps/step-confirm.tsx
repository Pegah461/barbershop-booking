"use client"

import { formatInTimeZone } from "date-fns-tz"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SHOP_TZ } from "@/lib/timezone"
import type { ServiceOption, AddonOption, WizardDetails } from "../types"

export function StepConfirm({
  service, addons, startsAt, details, totalCents, durationMins, submitting, onSubmit,
}: {
  service: ServiceOption
  addons: AddonOption[]
  startsAt: string
  details: WizardDetails
  totalCents: number
  durationMins: number
  submitting: boolean
  onSubmit: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Confirm your booking</h2>

      <div className="divide-y rounded-lg border text-sm">
        <Row label="Service" value={service.name} />
        {addons.length > 0 && <Row label="Add-ons" value={addons.map((a) => a.name).join(", ")} />}
        <Row label="When" value={formatInTimeZone(new Date(startsAt), SHOP_TZ, "EEEE, MMM d 'at' h:mm a")} />
        <Row label="Duration" value={`${durationMins} min`} />
        <Row label="Total" value={`$${(totalCents / 100).toFixed(2)}`} bold />
        <Row label="Name" value={details.customerName} />
        <Row label="Phone" value={details.customerPhone} />
        <Row label="Email" value={details.customerEmail} />
        {details.customerComments && <Row label="Comments" value={details.customerComments} />}
      </div>

      <Button className="w-full" size="lg" onClick={onSubmit} disabled={submitting}>
        {submitting ? "Booking…" : "Confirm booking"}
      </Button>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4 p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right", bold && "font-semibold")}>{value}</span>
    </div>
  )
}
