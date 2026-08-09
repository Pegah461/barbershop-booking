import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components"

export function EmailLayout({
  preview, heading, shopName, shopPhone, shopEmail, children,
}: {
  preview: string
  heading: string
  shopName: string
  shopPhone?: string
  shopEmail?: string
  children: React.ReactNode
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", padding: "32px", borderRadius: "8px", maxWidth: "480px" }}>
          <Text style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#71717a", margin: "0 0 8px" }}>
            {shopName}
          </Text>
          <Heading style={{ fontSize: "20px", margin: "0 0 20px", color: "#18181b" }}>{heading}</Heading>

          {children}

          <Hr style={{ borderColor: "#e4e4e7", margin: "28px 0 16px" }} />
          <Text style={{ fontSize: "12px", color: "#a1a1aa", margin: 0 }}>
            {shopName}
            {shopPhone ? ` · ${shopPhone}` : ""}
            {shopEmail ? ` · ${shopEmail}` : ""}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <Section style={{ marginBottom: "6px" }}>
      <Text style={{ fontSize: "14px", margin: 0, display: "inline-block", width: "110px", color: "#71717a" }}>
        {label}
      </Text>
      <Text style={{ fontSize: "14px", margin: 0, display: "inline-block", fontWeight: 600, color: "#18181b" }}>
        {value}
      </Text>
    </Section>
  )
}
