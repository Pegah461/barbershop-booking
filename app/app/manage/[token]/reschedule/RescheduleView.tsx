"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StepDatetime } from "@/app/book/steps/step-datetime"
import { rescheduleBooking } from "../actions"

export function RescheduleView({
  token, serviceId, addonIds, serviceName,
}: {
  token: string
  serviceId: string
  addonIds: string[]
  serviceName: string
}) {
  const [date, setDate] = useState<string | null>(null)
  const [startsAt, setStartsAt] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!startsAt) return
    startTransition(async () => {
      const result = await rescheduleBooking(token, startsAt)
      // A thrown redirect() on success never resolves here — only failures do.
      if (result?.error) {
        toast.error(result.error)
        setNotice(result.error)
        setStartsAt(null)
        setRefreshKey((k) => k + 1) // force StepDatetime to remount and refetch
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold">Reschedule your booking</h1>
        <p className="mt-1 text-sm text-muted-foreground">{serviceName}</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <StepDatetime
          key={refreshKey}
          serviceId={serviceId}
          addonIds={addonIds}
          date={date}
          startsAt={startsAt}
          notice={notice}
          slotsEndpoint={`/api/manage/${token}/slots`}
          onDateChange={(d) => { setDate(d); setStartsAt(null); setNotice(undefined) }}
          onSlotChange={(s) => { setStartsAt(s); setNotice(undefined) }}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/manage/${token}`}>Back</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={!startsAt || isPending}>
          {isPending ? "Saving…" : "Confirm new time"}
        </Button>
      </div>
    </div>
  )
}
