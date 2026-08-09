import { Button, Section, Text } from "@react-email/components"
import { EmailLayout, Row } from "./components/layout"

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
      heading="New booking"
      shopName={shopName}
    >
      <Section style={{ margin: "20px 0" }}>
        <Row label="Reference" value={reference} />
        <Row label="Service" value={serviceName} />
        {addonNames.length > 0 && <Row label="Add-ons" value={addonNames.join(", ")} />}
        <Row label="When" value={whenLabel} />
        <Row label="Total" value={totalLabel} />
        <Row label="Customer" value={customerName} />
        <Row label="Phone" value={customerPhone} />
        <Row label="Email" value={customerEmail} />
      </Section>

      {customerComments && (
        <Text style={{ fontSize: "14px", color: "#3f3f46" }}>
          <strong>Comments:</strong> {customerComments}
        </Text>
      )}

      <Button
        href={adminUrl}
        style={{
          backgroundColor: "#18181b", color: "#ffffff", fontSize: "14px", fontWeight: 600,
          padding: "12px 20px", borderRadius: "6px", textDecoration: "none",
        }}
      >
        View in admin
      </Button>
    </EmailLayout>
  )
}
