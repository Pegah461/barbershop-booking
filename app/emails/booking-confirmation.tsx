import { Section, Text } from "@react-email/components"
import {
  ActionButton,
  EmailLayout,
  Paragraph,
  ReferenceBlock,
  Row,
  emailTheme,
} from "./components/layout"

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
      heading="booking confirmed"
      shopName={shopName}
      shopPhone={shopPhone}
      shopEmail={shopEmail}
    >
      <Paragraph>
        Hi {customerName} — the chair is yours. Show this reference when you
        arrive, or just give your name.
      </Paragraph>

      <ReferenceBlock reference={reference} />

      <Section style={{ margin: "0 0 24px" }}>
        <Row label="Service" value={serviceName} />
        {addonNames.length > 0 && <Row label="Extras" value={addonNames.join(", ")} />}
        <Row label="When" value={whenLabel} />
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
        Use that button to move your appointment to another time or cancel it.
        The link is private to this booking and it&apos;s the only way to change
        it online, so keep this email. Pay at the shop on the day.
      </Text>
    </EmailLayout>
  )
}
