"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"
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
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
        This booking has been cancelled.
      </div>
    )
  }

  if (lockReason) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        {lockReason}
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/manage/${token}/reschedule`}>Reschedule</Link>
        </Button>
        <Button variant="destructive" className="flex-1" onClick={() => setDialogOpen(true)}>
          Cancel booking
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              This can&apos;t be undone. You&apos;ll need to make a new booking if you change your mind.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Keep booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
              {isPending ? "Cancelling…" : "Yes, cancel it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
