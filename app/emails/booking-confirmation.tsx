import { Button, Section, Text } from "@react-email/components"
import { EmailLayout, Row } from "./components/layout"

export type BookingConfirmationEmailProps = {
  reference: string
  customerName: string
  serviceName: string
  addonNames: string[]
  whenLabel: string
  totalLabel: string
  manageUrl: string
  shopName: string
  shopPhone: string
  shopEmail: string
}

export default function BookingConfirmationEmail({
  reference, customerName, serviceName, addonNames, whenLabel, totalLabel, manageUrl,
  shopName, shopPhone, shopEmail,
}: BookingConfirmationEmailProps) {
  return (
    <EmailLayout
      preview={`Your booking is confirmed for ${whenLabel}`}
      heading="Booking confirmed"
      shopName={shopName}
      shopPhone={shopPhone}
      shopEmail={shopEmail}
    >
      <Text style={{ fontSize: "14px", color: "#3f3f46" }}>
        Hi {customerName}, your appointment is booked. Here are the details:
      </Text>

      <Section style={{ margin: "20px 0" }}>
        <Row label="Reference" value={reference} />
        <Row label="Service" value={serviceName} />
        {addonNames.length > 0 && <Row label="Add-ons" value={addonNames.join(", ")} />}
        <Row label="When" value={whenLabel} />
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

      <Text style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "16px" }}>
        Need to change or cancel? Use the link above, or contact us directly.
      </Text>
    </EmailLayout>
  )
}
