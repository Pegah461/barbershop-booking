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
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[760px] px-5 py-12 sm:px-7 sm:py-16">
        <header>
          <p className="data-label text-talc-deep">Rescheduling</p>
          <h1 className="mt-3 text-[clamp(34px,7vw,52px)]">pick a new time</h1>
          <p className="mt-4 text-[17px] text-talc-deep">
            Keeping your {serviceName.toLowerCase()} — same booking, same price,
            just a different slot.
          </p>
        </header>

        <div className="mt-8 rounded-xl bg-card p-5 sm:p-7">
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

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <Button variant="outline" asChild>
            <Link href={`/manage/${token}`}>back</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={!startsAt || isPending}>
            {isPending ? "moving it…" : "confirm new time"}
          </Button>
        </div>
      </div>
    </main>
  )
}
