import { z } from "zod"

/**
 * A review left through the public site. Mirrors the `PublicReview` model.
 * Used by both the client form and the Server Action — the action re-parses
 * on the server and never trusts what the browser sent.
 */
export const PublicReviewSchema = z.object({
  rating: z
    .number({ message: "Pick a star rating" })
    .int()
    .min(1, "Pick a star rating")
    .max(5, "Pick a star rating"),
  authorName: z.string().trim().min(1, "Your name is required").max(80),
  authorEmail: z.email("Enter a valid email").max(160),
  comment: z
    .string()
    .trim()
    .min(4, "Tell us a little more")
    .max(1000, "Keep it under 1000 characters"),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Not a substitute for moderation — see the note on the model.
   */
  website: z.string().max(0).optional(),
})

export type PublicReviewValues = z.infer<typeof PublicReviewSchema>
