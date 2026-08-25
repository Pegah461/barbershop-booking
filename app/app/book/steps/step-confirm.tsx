"use client"

import { formatInTimeZone } from "date-fns-tz"
import { Button } from "@/components/ui/button"
import { cn, formatDuration, formatMoney } from "@/lib/utils"
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
      <h2 className="text-[26px]">check it over</h2>
      <p className="mt-2 text-[15px] text-talc-deep">
        Nothing is booked until you confirm.
      </p>

      <dl className="mt-6 divide-y divide-nape/10">
        <Row label="Service" value={service.name} />
        {addons.length > 0 && <Row label="Extras" value={addons.map((a) => a.name).join(", ")} />}
        <Row
          label="When"
          value={formatInTimeZone(new Date(startsAt), SHOP_TZ, "EEEE, MMM d 'at' h:mm a")}
        />
        <Row label="Takes" value={formatDuration(durationMins)} />
        <Row label="Total" value={formatMoney(totalCents)} strong />
        <Row label="Name" value={details.customerName} />
        <Row label="Phone" value={details.customerPhone} />
        <Row label="Email" value={details.customerEmail} />
        {details.customerComments && <Row label="Notes" value={details.customerComments} />}
      </dl>

      <Button
        className="mt-7 w-full"
        size="lg"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? "confirming…" : "confirm booking"}
      </Button>

      <p className="mt-3 text-center text-[13px] text-talc-deep">
        Pay at the shop. Cash on the day.
      </p>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="data-label shrink-0 text-talc-deep">{label}</dt>
      <dd
        className={cn(
          "text-right text-[15px] text-nape",
          strong && "font-mono text-[18px] font-medium tabular-nums",
        )}
      >
        {value}
      </dd>
    </div>
  )
}
