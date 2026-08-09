"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { formatInTimeZone } from "date-fns-tz"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClosureFormSchema, type ClosureFormValues } from "@/lib/validations/admin"
import { createClosure, deleteClosure } from "./actions"
import { SHOP_TZ } from "@/lib/timezone"

type Closure = { id: string; startsAt: Date; endsAt: Date; isAllDay: boolean; reason: string | null }

function AddClosureForm({ onAdded }: { onAdded: () => void }) {
  const [isPending, start] = useTransition()
  const form = useForm<ClosureFormValues>({
    resolver: zodResolver(ClosureFormSchema),
    defaultValues: { date: "", isAllDay: true, startTime: "", endTime: "", reason: "" },
  })
  const isAllDay = form.watch("isAllDay")

  const onSubmit = form.handleSubmit((data) => {
    start(async () => {
      const result = await createClosure(data)
      if (result.error) toast.error(result.error)
      else { toast.success("Closure added"); form.reset({ date: "", isAllDay: true, startTime: "", endTime: "", reason: "" }); onAdded() }
    })
  })

  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-white p-6 space-y-4">
      <h2 className="font-semibold">Add closure</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" {...form.register("date")} />
          {form.formState.errors.date && <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>}
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch checked={isAllDay} onCheckedChange={(v) => form.setValue("isAllDay", v)} />
          <Label>All-day closure</Label>
        </div>
        {!isAllDay && (
          <>
            <div className="space-y-1">
              <Label>Start time</Label>
              <Input type="time" {...form.register("startTime")} />
              {form.formState.errors.startTime && <p className="text-xs text-destructive">{form.formState.errors.startTime.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>End time</Label>
              <Input type="time" {...form.register("endTime")} />
              {form.formState.errors.endTime && <p className="text-xs text-destructive">{form.formState.errors.endTime.message}</p>}
            </div>
          </>
        )}
      </div>
      <div className="space-y-1">
        <Label>Reason (optional)</Label>
        <Textarea {...form.register("reason")} rows={2} />
      </div>
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Add closure"}</Button>
    </form>
  )
}

export function ClosureManager({ closures }: { closures: Closure[] }) {
  const [isPending, start] = useTransition()
  const [key, setKey] = useState(0) // reset form after add

  function handleDelete(id: string) {
    if (!confirm("Remove this closure?")) return
    start(async () => {
      const result = await deleteClosure(id)
      if (result.error) toast.error(result.error)
      else toast.success("Closure removed")
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Closures</h1>

      <AddClosureForm key={key} onAdded={() => setKey((k) => k + 1)} />

      <Separator />

      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Upcoming closures</h2>
        {closures.length === 0 && (
          <p className="text-muted-foreground text-sm">No closures scheduled.</p>
        )}
        {closures.map((c) => (
          <div key={c.id} className="flex items-start justify-between rounded-lg border bg-white p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {formatInTimeZone(c.startsAt, SHOP_TZ, "MMM d, yyyy")}
                </span>
                {c.isAllDay
                  ? <Badge variant="secondary">All day</Badge>
                  : (
                    <span className="text-sm text-muted-foreground">
                      {formatInTimeZone(c.startsAt, SHOP_TZ, "h:mm a")} – {formatInTimeZone(c.endsAt, SHOP_TZ, "h:mm a")}
                    </span>
                  )
                }
              </div>
              {c.reason && <p className="text-xs text-muted-foreground">{c.reason}</p>}
            </div>
            <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => handleDelete(c.id)} disabled={isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
