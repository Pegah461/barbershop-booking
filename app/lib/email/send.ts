import { Resend } from "resend"
import { render } from "@react-email/render"
import type { ReactElement } from "react"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL || "Barbershop <onboarding@resend.dev>"

export async function sendEmail({
  to, subject, react, logExtra,
}: {
  to: string
  subject: string
  react: ReactElement
  /** Extra key/value lines printed above the HTML dump in console-fallback mode. */
  logExtra?: Record<string, string>
}): Promise<void> {
  if (!resend) {
    const html = await render(react)
    console.log(`\n───── [email] RESEND_API_KEY not set — logging instead of sending ─────`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    for (const [key, value] of Object.entries(logExtra ?? {})) console.log(`${key}: ${value}`)
    console.log(html)
    console.log(`───── end email ─────\n`)
    return
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, react })
  if (error) console.error("Failed to send email via Resend:", error)
}
