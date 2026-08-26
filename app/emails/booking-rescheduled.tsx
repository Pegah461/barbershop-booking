import { Section, Text } from "@react-email/components"
import {
  ActionButton,
  EmailLayout,
  Paragraph,
  ReferenceBlock,
  Row,
  emailTheme,
} from "./components/layout"

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
      heading="booking moved"
      shopName={shopName}
      shopPhone={shopPhone}
      shopEmail={shopEmail}
    >
      <Paragraph>
        Hi {customerName} — your appointment has been moved. Here it is again.
      </Paragraph>

      <ReferenceBlock reference={reference} />

      <Section style={{ margin: "0 0 24px" }}>
        <Row label="Service" value={serviceName} />
        {addonNames.length > 0 && <Row label="Extras" value={addonNames.join(", ")} />}
        <Row label="Was" value={previousWhenLabel} />
        <Row label="Now" value={whenLabel} />
        <Row label="Total" value={totalLabel} />
      </Section>

      <ActionButton href={manageUrl}>manage booking</ActionButton>

      <Text
        style={{
          margin: "16px 0 0",
          fontSize: "13px",
          lineHeight: 1.6,
          color: emailTheme.MUTED,
        }}
      >
        That link is private to this booking — keep this email if you might need
        to change it again.
      </Text>
    </EmailLayout>
  )
}
