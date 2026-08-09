"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScheduleFormSchema, type ScheduleFormValues } from "@/lib/validations/admin"
import { saveSchedule } from "./actions"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function ScheduleForm({ initialHours }: { initialHours: ScheduleFormValues["hours"] }) {
  const [isPending, startTransition] = useTransition()

  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleFormSchema),
    defaultValues: { hours: initialHours },
  })

  const { fields } = useFieldArray({ control, name: "hours" })
  const watchedHours = watch("hours")

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await saveSchedule(data)
      if (result.error) toast.error(result.error)
      else toast.success("Schedule saved")
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3 w-28">Day</th>
              <th className="px-4 py-3 w-20">Open</th>
              <th className="px-4 py-3">Open time</th>
              <th className="px-4 py-3">Close time</th>
              <th className="px-4 py-3">Break start</th>
              <th className="px-4 py-3">Break end</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, i) => {
              const isOpen = watchedHours?.[i]?.isOpen ?? false
              return (
                <tr key={field.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{DAY_NAMES[field.dayOfWeek]}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={isOpen}
                      onCheckedChange={(v) => setValue(`hours.${i}.isOpen`, v)}
                    />
                  </td>
                  {(["openTime", "closeTime", "breakStart", "breakEnd"] as const).map((col) => (
                    <td key={col} className="px-4 py-2">
                      <Input
                        type="time"
                        disabled={!isOpen}
                        {...register(`hours.${i}.${col}`)}
                        className="w-32 disabled:opacity-40"
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {errors.hours && (
        <p className="text-sm text-destructive">Please fix the errors above.</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save schedule"}
      </Button>
    </form>
  )
}
