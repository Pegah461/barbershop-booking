"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SettingsFormSchema, type SettingsFormValues } from "@/lib/validations/admin"
import { saveSettings } from "./actions"

type Settings = {
  shopName: string; shopPhone: string; shopEmail: string
  slotIntervalMins: number; bufferMins: number; minLeadTimeHours: number
  maxBookAheadDays: number; cancelCutoffHours: number
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [isPending, start] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: settings,
  })

  const onSubmit = handleSubmit((data) => {
    start(async () => {
      const result = await saveSettings(data)
      if (result.error) toast.error(result.error)
      else toast.success("Settings saved")
    })
  })

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">Shop info</h2>
        <Field label="Shop name" error={errors.shopName?.message}>
          <Input {...register("shopName")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" error={errors.shopPhone?.message}>
            <Input {...register("shopPhone")} />
          </Field>
          <Field label="Email" error={errors.shopEmail?.message}>
            <Input type="email" {...register("shopEmail")} />
          </Field>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">Booking rules</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Slot interval (min)" error={errors.slotIntervalMins?.message}>
            <Input type="number" min="5" max="120" {...register("slotIntervalMins", { valueAsNumber: true })} />
          </Field>
          <Field label="Buffer between appts (min)" error={errors.bufferMins?.message}>
            <Input type="number" min="0" {...register("bufferMins", { valueAsNumber: true })} />
          </Field>
          <Field label="Min lead time (hours)" error={errors.minLeadTimeHours?.message}>
            <Input type="number" min="0" {...register("minLeadTimeHours", { valueAsNumber: true })} />
          </Field>
          <Field label="Max days ahead" error={errors.maxBookAheadDays?.message}>
            <Input type="number" min="1" {...register("maxBookAheadDays", { valueAsNumber: true })} />
          </Field>
          <Field label="Cancel cutoff (hours)" error={errors.cancelCutoffHours?.message}>
            <Input type="number" min="0" {...register("cancelCutoffHours", { valueAsNumber: true })} />
          </Field>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save settings"}</Button>
    </form>
  )
}
