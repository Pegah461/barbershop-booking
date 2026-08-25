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
      <form onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-[26px]">your details</h2>
        <p className="mt-2 text-[15px] text-talc-deep">
          We send the confirmation by email — it carries your reference and the
          link to change or cancel.
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.customerName}
                {...form.register("customerName")}
              />
              {form.formState.errors.customerName && (
                <p className="text-[13px] text-betel">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                type="tel"
                autoComplete="tel"
                aria-invalid={!!form.formState.errors.customerPhone}
                {...form.register("customerPhone")}
              />
              {form.formState.errors.customerPhone && (
                <p className="text-[13px] text-betel">
                  {form.formState.errors.customerPhone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              type="email"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.customerEmail}
              {...form.register("customerEmail")}
            />
            {form.formState.errors.customerEmail && (
              <p className="text-[13px] text-betel">
                {form.formState.errors.customerEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customerComments">Anything we should know (optional)</Label>
            <Textarea
              id="customerComments"
              rows={3}
              placeholder="Number on the sides, a photo you're working from, anything else"
              aria-invalid={!!form.formState.errors.customerComments}
              {...form.register("customerComments")}
            />
            {form.formState.errors.customerComments && (
              <p className="text-[13px] text-betel">
                {form.formState.errors.customerComments.message}
              </p>
            )}
          </div>
        </div>
      </form>
    )
  },
)
