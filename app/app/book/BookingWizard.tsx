"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { formatInTimeZone } from "date-fns-tz"
import { toast } from "sonner"
import { Blueprint } from "@/components/ui/blueprint"
import { Button } from "@/components/ui/button"
import { SHOP_TZ } from "@/lib/timezone"
import { StepIndicator } from "./StepIndicator"
import { PriceSummary } from "./PriceSummary"
import { StepService } from "./steps/step-service"
import { StepAddons } from "./steps/step-addons"
import { StepDatetime } from "./steps/step-datetime"
import { StepDetails, type StepDetailsHandle } from "./steps/step-details"
import { StepConfirm } from "./steps/step-confirm"
import type { ServiceOption, AddonOption, WizardState } from "./types"

const STORAGE_KEY = "booking-wizard:v1"
const STEP_LABELS = ["Service", "Add-ons", "Date & time", "Details", "Confirm"]

const DEFAULT_STATE: WizardState = {
  step: 1,
  maxStepReached: 1,
  serviceId: null,
  addonIds: [],
  date: null,
  startsAt: null,
  details: { customerName: "", customerPhone: "", customerEmail: "", customerComments: "" },
}

export function BookingWizard({
  services, addons, initialServiceId = null,
}: {
  services: ServiceOption[]
  addons: AddonOption[]
  /** Preselected service from a "Book this" deep link on the landing page. */
  initialServiceId?: string | null
}) {
  const router = useRouter()
  const [state, setState] = useState<WizardState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [slotTakenNotice, setSlotTakenNotice] = useState(false)
  const detailsRef = useRef<StepDetailsHandle>(null)

  // Hydrate from sessionStorage after mount only — reading it during the
  // initial render would desync server/client output and break hydration.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      const stored: WizardState = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE
      // A "Book this" deep link is an explicit choice — it overrides whatever
      // service was left in storage, and clears everything derived from it.
      const next =
        initialServiceId && initialServiceId !== stored.serviceId
          ? { ...stored, serviceId: initialServiceId, addonIds: [], date: null, startsAt: null }
          : stored
      // One-time sync read of a browser-only API on mount — the `hydrated`
      // gate below (not this callback) is what prevents the SSR/CSR mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(next)
    } catch {
      // corrupt or unavailable storage — fall back to defaults
    }
    setHydrated(true)
  }, [initialServiceId])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  function update(patch: Partial<WizardState>) {
    setState((s) => ({ ...s, ...patch }))
  }

  const selectedService = services.find((s) => s.id === state.serviceId) ?? null
  const selectedAddons = addons.filter((a) => state.addonIds.includes(a.id))
  const totalCents = (selectedService?.priceCents ?? 0) + selectedAddons.reduce((s, a) => s + a.priceCents, 0)
  const durationMins = (selectedService?.durationMins ?? 0) + selectedAddons.reduce((s, a) => s + a.extraDurationMins, 0)

  const canAdvance =
    state.step === 1 ? !!state.serviceId :
    state.step === 3 ? !!state.startsAt :
    true

  function goToStep(step: number) {
    if (step <= state.maxStepReached) setState((s) => ({ ...s, step }))
  }

  function goBack() {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) }))
  }

  async function goNext() {
    if (state.step === 4) {
      const values = await detailsRef.current?.submit()
      if (!values) return
      const details = { ...values, customerComments: values.customerComments ?? "" }
      setState((s) => ({ ...s, details, step: 5, maxStepReached: Math.max(s.maxStepReached, 5) }))
      return
    }
    if (!canAdvance) return
    setState((s) => {
      const next = Math.min(5, s.step + 1)
      return { ...s, step: next, maxStepReached: Math.max(s.maxStepReached, next) }
    })
  }

  async function handleSubmit() {
    if (!selectedService || !state.startsAt) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          addonIds:  state.addonIds,
          startsAt:  state.startsAt,
          ...state.details,
        }),
      })

      if (res.status === 409) {
        const body = await res.json().catch(() => null)
        toast.error(body?.error ?? "That slot was just taken. Please pick another time.")
        setSlotTakenNotice(true)
        setState((s) => ({ ...s, startsAt: null, step: 3, maxStepReached: Math.max(s.maxStepReached, 3) }))
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast.error(body?.error ?? "Failed to create booking. Please try again.")
        return
      }

      const body = await res.json()
      sessionStorage.removeItem(STORAGE_KEY)
      router.push(`/book/success/${body.reference}`)
    } catch {
      toast.error("Network error — please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Avoid a flash of default (step-1) content before sessionStorage loads.
  if (!hydrated) return null

  const whenLabel = state.startsAt
    ? formatInTimeZone(new Date(state.startsAt), SHOP_TZ, "EEE, MMM d 'at' h:mm a")
    : undefined

  return (
    <div className="mx-auto w-full max-w-[780px] space-y-5 px-7 py-8">
      <StepIndicator labels={STEP_LABELS} current={state.step} maxReached={state.maxStepReached} onSelect={goToStep} />

      <PriceSummary
        service={selectedService}
        addons={selectedAddons}
        totalCents={totalCents}
        durationMins={durationMins}
        whenLabel={whenLabel}
      />

      <Blueprint className="p-6">
        {state.step === 1 && (
          <StepService
            services={services}
            selectedId={state.serviceId}
            onSelect={(serviceId) => update({ serviceId, addonIds: [], date: null, startsAt: null })}
          />
        )}

        {state.step === 2 && (
          <StepAddons addons={addons} selectedIds={state.addonIds} onChange={(addonIds) => update({ addonIds })} />
        )}

        {state.step === 3 && selectedService && (
          <StepDatetime
            serviceId={selectedService.id}
            addonIds={state.addonIds}
            date={state.date}
            startsAt={state.startsAt}
            notice={slotTakenNotice ? "That slot was just taken — please pick another time." : undefined}
            onDateChange={(date) => update({ date, startsAt: null })}
            onSlotChange={(startsAt) => { update({ startsAt }); setSlotTakenNotice(false) }}
          />
        )}

        {state.step === 4 && (
          <StepDetails ref={detailsRef} defaultValues={state.details} />
        )}

        {state.step === 5 && selectedService && state.startsAt && (
          <StepConfirm
            service={selectedService}
            addons={selectedAddons}
            startsAt={state.startsAt}
            details={state.details}
            totalCents={totalCents}
            durationMins={durationMins}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </Blueprint>

      <div className="flex justify-between">
        <Button variant="outline" onClick={goBack} disabled={state.step === 1}>
          Back
        </Button>
        {state.step < 5 && (
          <Button className="blueprint" onClick={goNext} disabled={!canAdvance}>
            <i className="corner corner-tl" />
            <i className="corner corner-tr" />
            <i className="corner corner-bl" />
            <i className="corner corner-br" />
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
