"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { cancelBooking } from "./actions"

export function ManageBookingActions({
  token, lockReason,
}: {
  token: string
  lockReason: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelBooking(token)
      if (result.error) {
        toast.error(result.error)
        setDialogOpen(false)
        return
      }
      setDialogOpen(false)
      setCancelled(true)
      toast.success("Booking cancelled")
    })
  }

  if (cancelled) {
    return (
      <div className="rounded-xl bg-card p-6">
        <span className="flex size-10 items-center justify-center rounded-full bg-barbicide text-nape">
          <Check aria-hidden className="size-5" strokeWidth={3} />
        </span>
        <h2 className="mt-4 text-[20px]">Booking cancelled</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-talc-deep">
          That slot has gone back on the calendar and we&rsquo;ve emailed you a
          confirmation. You&rsquo;re welcome to book again any time, or just walk
          in.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/book">book again</Link>
        </Button>
      </div>
    )
  }

  if (lockReason) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-card p-6">
        <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-talc-deep" />
        <div>
          <h2 className="text-[20px]">Can&rsquo;t change this online</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-talc-deep">{lockReason}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl bg-card p-6">
        <h2 className="text-[20px]">Need to change it?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-talc-deep">
          Move it to another time, or cancel and free the slot for someone else.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/manage/${token}/reschedule`}>pick a new time</Link>
          </Button>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            cancel booking
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>cancel this booking?</DialogTitle>
            <DialogDescription>
              The slot goes back on the calendar straight away. This can&apos;t
              be undone — you&apos;d need to make a new booking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              keep it
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
              {isPending ? "cancelling…" : "yes, cancel it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
