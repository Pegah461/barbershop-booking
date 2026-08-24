"use client"

import { forwardRef, useImperativeHandle } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CustomerDetailsSchema, type CustomerDetailsValues } from "@/lib/validations/booking"

export type StepDetailsHandle = {
  /** Validates the form and resolves the values, or null if invalid. */
  submit: () => Promise<CustomerDetailsValues | null>
}

export const StepDetails = forwardRef<StepDetailsHandle, { defaultValues: CustomerDetailsValues }>(
  function StepDetails({ defaultValues }, ref) {
    const form = useForm<CustomerDetailsValues>({
      resolver: zodResolver(CustomerDetailsSchema),
      defaultValues,
    })

    useImperativeHandle(ref, () => ({
      submit: () =>
        new Promise((resolve) => {
          form.handleSubmit(
            (values) => resolve(values),
            () => resolve(null),
          )()
        }),
    }))

    return (
      <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
        <h4 className="mb-3.5">Your details</h4>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="customerName">Name</Label>
            <Input id="customerName" placeholder="Full name" {...form.register("customerName")} />
            {form.formState.errors.customerName && (
              <p className="text-xs text-destructive">{form.formState.errors.customerName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="customerPhone">Phone</Label>
            <Input id="customerPhone" type="tel" placeholder="e.g. 555 0148" {...form.register("customerPhone")} />
            {form.formState.errors.customerPhone && (
              <p className="text-xs text-destructive">{form.formState.errors.customerPhone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="customerEmail">Email</Label>
          <Input id="customerEmail" type="email" placeholder="you@example.com" {...form.register("customerEmail")} />
          {form.formState.errors.customerEmail && (
            <p className="text-xs text-destructive">{form.formState.errors.customerEmail.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="customerComments">Comments (optional)</Label>
          <Textarea
            id="customerComments"
            rows={3}
            placeholder="Anything the barber should know"
            {...form.register("customerComments")}
          />
          {form.formState.errors.customerComments && (
            <p className="text-xs text-destructive">{form.formState.errors.customerComments.message}</p>
          )}
        </div>
      </form>
    )
  },
)
