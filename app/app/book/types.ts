export type ServiceOption = {
  id: string
  name: string
  priceCents: number
  durationMins: number
}

export type AddonOption = {
  id: string
  name: string
  priceCents: number
  extraDurationMins: number
}

export type WizardDetails = {
  customerName: string
  customerPhone: string
  customerEmail: string
  customerComments: string
}

export type WizardState = {
  step: number
  maxStepReached: number
  serviceId: string | null
  addonIds: string[]
  date: string | null // YYYY-MM-DD, shop-local calendar date
  startsAt: string | null // ISO UTC instant of the selected slot
  details: WizardDetails
}
