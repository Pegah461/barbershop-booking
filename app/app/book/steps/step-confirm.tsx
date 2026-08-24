"use client"

import { formatInTimeZone } from "date-fns-tz"
import { Button } from "@/components/ui/button"
import { cn, formatMoney } from "@/lib/utils"
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
    <div>
      <h4 className="mb-3.5">Confirm your booking</h4>

      <table className="w-full border-collapse text-sm">
        <tbody>
          <Row label="Service" value={service.name} />
          {addons.length > 0 && <Row label="Add-ons" value={addons.map((a) => a.name).join(", ")} />}
          <Row
            label="When"
            value={formatInTimeZone(new Date(startsAt), SHOP_TZ, "EEEE, MMM d 'at' h:mm a")}
          />
          <Row label="Duration" value={`${durationMins} min`} />
          <Row label="Total" value={formatMoney(totalCents)} bold />
          <Row label="Name" value={details.customerName} />
          <Row label="Phone" value={details.customerPhone} />
          <Row label="Email" value={details.customerEmail} />
          {details.customerComments && <Row label="Comments" value={details.customerComments} />}
        </tbody>
      </table>

      <Button
        className="blueprint mt-4.5 w-full"
        size="lg"
        onClick={onSubmit}
        disabled={submitting}
      >
        <i className="corner corner-tl" />
        <i className="corner corner-tr" />
        <i className="corner corner-bl" />
        <i className="corner corner-br" />
        {submitting ? "Booking…" : "Confirm booking"}
      </Button>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className="border-b border-foreground/[0.08]">
      <th className="w-[34%] px-1.5 py-2 text-left text-[11px] font-normal uppercase tracking-[0.08em] text-foreground/60">
        {label}
      </th>
      <td className={cn("px-1.5 py-2 text-right", bold && "font-heading text-base font-semibold")}>
        {value}
      </td>
    </tr>
  )
}
