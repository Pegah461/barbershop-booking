import { Button, Section, Text } from "@react-email/components"
import { EmailLayout, Row } from "./components/layout"

export type BookingRescheduledEmailProps = {
  reference: string
  customerName: string
  serviceName: string
  addonNames: string[]
  previousWhenLabel: string
  whenLabel: string
  totalLabel: string
  manageUrl: string
  shopName: string
  shopPhone: string
  shopEmail: string
}

export default function BookingRescheduledEmail({
  reference, customerName, serviceName, addonNames, previousWhenLabel, whenLabel, totalLabel,
  manageUrl, shopName, shopPhone, shopEmail,
}: BookingRescheduledEmailProps) {
  return (
    <EmailLayout
      preview={`Your booking has moved to ${whenLabel}`}
      heading="Booking rescheduled"
      shopName={shopName}
      shopPhone={shopPhone}
      shopEmail={shopEmail}
    >
      <Text style={{ fontSize: "14px", color: "#3f3f46" }}>
        Hi {customerName}, your appointment has been moved. Here are the updated details:
      </Text>

      <Section style={{ margin: "20px 0" }}>
        <Row label="Reference" value={reference} />
        <Row label="Service" value={serviceName} />
        {addonNames.length > 0 && <Row label="Add-ons" value={addonNames.join(", ")} />}
        <Row label="Was" value={previousWhenLabel} />
        <Row label="Now" value={whenLabel} />
        <Row label="Total" value={totalLabel} />
      </Section>

      <Button
        href={manageUrl}
        style={{
          backgroundColor: "#18181b", color: "#ffffff", fontSize: "14px", fontWeight: 600,
          padding: "12px 20px", borderRadius: "6px", textDecoration: "none",
        }}
      >
        Manage your booking
      </Button>
    </EmailLayout>
  )
}
