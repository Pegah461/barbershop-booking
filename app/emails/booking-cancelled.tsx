import { Section } from "@react-email/components"
import { EmailLayout, Paragraph, Row } from "./components/layout"

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
      heading="booking cancelled"
      shopName={shopName}
      shopPhone={shopPhone}
      shopEmail={shopEmail}
    >
      <Paragraph>
        This appointment is cancelled and the slot has gone back on the
        calendar. If you didn&apos;t do this, call the shop and we&apos;ll sort
        it out.
      </Paragraph>

      <Section style={{ margin: "0 0 20px" }}>
        <Row label="Reference" value={reference} />
        <Row label="Service" value={serviceName} />
        <Row label="Was" value={whenLabel} />
      </Section>

      <Paragraph>
        You&apos;re welcome back any time — walk in, or book another slot on the
        site.
      </Paragraph>
    </EmailLayout>
  )
}
