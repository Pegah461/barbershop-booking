import { Section, Text } from "@react-email/components"
import { EmailLayout, Row } from "./components/layout"

export type BookingCancelledEmailProps = {
  reference: string
  serviceName: string
  whenLabel: string
  shopName: string
  shopPhone: string
  shopEmail: string
}

export default function BookingCancelledEmail({
  reference, serviceName, whenLabel, shopName, shopPhone, shopEmail,
}: BookingCancelledEmailProps) {
  return (
    <EmailLayout
      preview={`Your booking for ${whenLabel} has been cancelled`}
      heading="Booking cancelled"
      shopName={shopName}
      shopPhone={shopPhone}
      shopEmail={shopEmail}
    >
      <Text style={{ fontSize: "14px", color: "#3f3f46" }}>
        This appointment has been cancelled. If this wasn&apos;t you, please contact us.
      </Text>

      <Section style={{ margin: "20px 0" }}>
        <Row label="Reference" value={reference} />
        <Row label="Service" value={serviceName} />
        <Row label="Was" value={whenLabel} />
      </Section>

      <Text style={{ fontSize: "14px", color: "#3f3f46" }}>
        Want to book again? We&apos;d love to see you.
      </Text>
    </EmailLayout>
  )
}
