import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row as EmailRow,
  Section,
  Text,
} from "@react-email/components"

/**
 * Shared shell for every transactional email.
 *
 * Email clients strip <style> blocks, CSS custom properties and web fonts, so
 * the fade palette is written out as literal hex here and the display voice
 * falls back to a bold system sans. Everything is inline-styled and laid out
 * with tables — the only thing that renders reliably everywhere.
 */

const INK = "#191d1e"
const IRON = "#333a3c"
const MUTED = "#5f6764"
const STRIP = "#e9e6de"
const CARD = "#f2efe8"
const BARBICIDE = "#0fa3ae"

const SANS = "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'IBM Plex Mono', Menlo, Consolas, 'Courier New', monospace"

export function EmailLayout({
  preview,
  heading,
  shopName,
  shopPhone,
  shopEmail,
  children,
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
      <Body style={{ backgroundColor: STRIP, margin: 0, padding: "32px 0", fontFamily: SANS }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "0 auto",
            maxWidth: "540px",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* — wordmark band — */}
          <Section style={{ backgroundColor: INK, padding: "20px 28px" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: SANS,
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: STRIP,
              }}
            >
              fades<span style={{ color: BARBICIDE }}>.</span>
            </Text>
          </Section>

          <Section style={{ padding: "28px" }}>
            <Heading
              as="h1"
              style={{
                margin: "0 0 20px",
                fontFamily: SANS,
                fontSize: "28px",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.7px",
                color: INK,
              }}
            >
              {heading}
            </Heading>

            {children}
          </Section>

          {/* — footer — */}
          <Section style={{ backgroundColor: CARD, padding: "20px 28px" }}>
            <Text style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: MUTED }}>
              {shopName}
              {shopPhone ? ` · ${shopPhone}` : ""}
              {shopEmail ? ` · ${shopEmail}` : ""}
            </Text>
            <Text style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: 1.6, color: MUTED }}>
              Honiara Town, Solomon Islands
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

/** A label/value line. Laid out as a table row so the columns hold up. */
export function Row({ label, value }: { label: string; value: string }) {
  return (
    <EmailRow style={{ marginBottom: "2px" }}>
      <Column style={{ width: "120px", verticalAlign: "top", paddingBottom: "10px" }}>
        <Text
          style={{
            margin: 0,
            fontFamily: MONO,
            fontSize: "11px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {label}
        </Text>
      </Column>
      <Column style={{ verticalAlign: "top", paddingBottom: "10px" }}>
        <Text style={{ margin: 0, fontSize: "15px", lineHeight: 1.4, color: INK }}>{value}</Text>
      </Column>
    </EmailRow>
  )
}

/** Body copy. */
export function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.6, color: IRON }}>
      {children}
    </Text>
  )
}

/** The booking reference, shown as the code it is. */
export function ReferenceBlock({ reference }: { reference: string }) {
  return (
    <Section
      style={{
        backgroundColor: CARD,
        borderRadius: "10px",
        padding: "16px 20px",
        margin: "0 0 20px",
      }}
    >
      <Text
        style={{
          margin: 0,
          fontFamily: MONO,
          fontSize: "11px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        Your reference
      </Text>
      <Text
        style={{
          margin: "6px 0 0",
          fontFamily: MONO,
          fontSize: "24px",
          fontWeight: 500,
          letterSpacing: "1px",
          color: INK,
        }}
      >
        {reference}
      </Text>
    </Section>
  )
}

/**
 * Primary action. A padded anchor rather than a <button> — it is the one
 * shape every email client agrees on.
 */
export function ActionButton({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: BARBICIDE,
        color: INK,
        fontFamily: SANS,
        fontSize: "15px",
        fontWeight: 700,
        padding: "14px 24px",
        borderRadius: "8px",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  )
}

export const emailTheme = { INK, IRON, MUTED, STRIP, CARD, BARBICIDE, SANS, MONO }
