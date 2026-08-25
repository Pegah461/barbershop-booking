"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"
import { PublicReviewSchema } from "@/lib/validations/review"

export type SubmitReviewResult = { ok: true } | { ok: false; error: string }

/**
 * Store a review left on the public site.
 *
 * Reviews publish immediately (`PublicReview.isApproved` defaults to true)
 * because there is no moderation screen yet. The only spam defence right now
 * is the honeypot field plus the length limits in the schema — worth
 * revisiting when the admin phase adds a queue.
 */
export async function submitReview(input: unknown): Promise<SubmitReviewResult> {
  const parsed = PublicReviewSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." }
  }

  const { rating, authorName, authorEmail, comment, website } = parsed.data

  // Honeypot tripped — accept silently so the bot learns nothing, store nothing.
  if (website) return { ok: true }

  try {
    await db.publicReview.create({
      data: { rating, authorName, authorEmail, comment },
    })
  } catch (e) {
    console.error("Failed to save review", e)
    return {
      ok: false,
      error: "We couldn't save your review just now. Please try again in a moment.",
    }
  }

  revalidatePath("/")
  return { ok: true }
}
