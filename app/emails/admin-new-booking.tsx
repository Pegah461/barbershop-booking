import { Section, Text } from "@react-email/components"
import {
  ActionButton,
  EmailLayout,
  ReferenceBlock,
  Row,
  emailTheme,
} from "./components/layout"

export type AdminNewBookingEmailProps = {
  reference: string
  serviceName: string
  addonNames: string[]
  whenLabel: string
  totalLabel: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerComments: string | null
  adminUrl: string
  shopName: string
}

export default function AdminNewBookingEmail({
  reference, serviceName, addonNames, whenLabel, totalLabel,
  customerName, customerPhone, customerEmail, customerComments, adminUrl, shopName,
}: AdminNewBookingEmailProps) {
  return (
    <EmailLayout
      preview={`New booking from ${customerName} — ${whenLabel}`}
      heading="new booking"
      shopName={shopName}
    >
      <ReferenceBlock reference={reference} />

      <Section style={{ margin: "0 0 24px" }}>
        <Row label="When" value={whenLabel} />
        <Row label="Service" value={serviceName} />
        {addonNames.length > 0 && <Row label="Extras" value={addonNames.join(", ")} />}
        <Row label="Total" value={totalLabel} />
        <Row label="Customer" value={customerName} />
        <Row label="Phone" value={customerPhone} />
        <Row label="Email" value={customerEmail} />
        {customerComments && <Row label="Notes" value={customerComments} />}
      </Section>

      <ActionButton href={adminUrl}>open in admin</ActionButton>

      <Text
        style={{
          margin: "16px 0 0",
          fontSize: "13px",
          lineHeight: 1.6,
          color: emailTheme.MUTED,
        }}
      >
        Sent to the shop, not the customer.
      </Text>
    </EmailLayout>
  )
}
