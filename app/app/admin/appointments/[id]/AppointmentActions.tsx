"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { markCompleted, markNoShow, markCancelled } from "../actions"

export function AppointmentActions({ id }: { id: string }) {
  const [isPending, start] = useTransition()
  const router = useRouter()

  async function run(fn: (id: string) => Promise<{ error?: string }>, msg: string) {
    start(async () => {
      const r = await fn(id)
      if (r.error) toast.error(r.error)
      else { toast.success(msg); router.refresh() }
    })
  }

  return (
    <>
      <Button onClick={() => run(markCompleted, "Marked as completed")} disabled={isPending}>Complete</Button>
      <Button variant="outline" onClick={() => run(markNoShow, "Marked as no-show")} disabled={isPending}>No-show</Button>
      <Button variant="destructive" onClick={() => run(markCancelled, "Cancelled")} disabled={isPending}>Cancel</Button>
    </>
  )
}
