import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import type { ReactElement } from "react"

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

// Built once at module scope, like the client it replaces. `service: "gmail"`
// resolves nodemailer's built-in Gmail host/port/TLS settings — an App
// Password is required here, not the account's normal login password (Gmail
// only accepts App Passwords over SMTP once 2-Step Verification is on).
const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      })
    : null

export async function sendEmail({
  to, subject, react, logExtra,
}: {
  to: string
  subject: string
  react: ReactElement
  /** Extra key/value lines printed above the HTML dump in console-fallback mode. */
  logExtra?: Record<string, string>
}): Promise<void> {
  const html = await render(react)

  if (!transporter) {
    console.log(`\n───── [email] GMAIL_USER/GMAIL_APP_PASSWORD not set — logging instead of sending ─────`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    for (const [key, value] of Object.entries(logExtra ?? {})) console.log(`${key}: ${value}`)
    console.log(html)
    console.log(`───── end email ─────\n`)
    return
  }

  // Callers treat email sending as best-effort — a delivery failure must
  // never throw into the booking flow, so it's caught and logged here.
  try {
    await transporter.sendMail({ from: GMAIL_USER, to, subject, html })
  } catch (error) {
    console.error("Failed to send email via Gmail SMTP:", error)
  }
}
