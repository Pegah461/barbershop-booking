"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState, useTransition } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { submitReview } from "@/app/actions/reviews"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { transition } from "@/lib/motion"
import { PublicReviewSchema } from "@/lib/validations/review"
import { cn } from "@/lib/utils"

type FieldErrors = Partial<Record<"rating" | "authorName" | "authorEmail" | "comment", string>>

export function ReviewForm() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    const candidate = {
      rating,
      authorName: String(form.get("authorName") ?? ""),
      authorEmail: String(form.get("authorEmail") ?? ""),
      comment: String(form.get("comment") ?? ""),
      website: String(form.get("website") ?? ""),
    }

    const parsed = PublicReviewSchema.safeParse(candidate)
    if (!parsed.success) {
      const next: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (
          key === "rating" ||
          key === "authorName" ||
          key === "authorEmail" ||
          key === "comment"
        ) {
          next[key] ??= issue.message
        }
      }
      setErrors(next)
      return
    }

    setErrors({})
    startTransition(async () => {
      const result = await submitReview(parsed.data)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setDone(true)
      toast.success("Review posted")
    })
  }

  if (done) {
    return (
      <div className="rounded-lg bg-card p-6">
        <p className="font-display text-[20px] font-bold lowercase text-nape">
          thanks — that&rsquo;s posted
        </p>
        <p className="mt-2 text-talc-deep">
          Your review is on the page now. Scroll down to see it with the rest.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-[20px] font-bold lowercase text-nape">
            been in for a cut?
          </p>
          <p className="mt-1 text-talc-deep">Tell people how it went.</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="rounded-md bg-barbicide px-5 py-3 font-display text-[15px] font-bold lowercase text-nape transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          {open ? "close" : "write a review"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            key="review-form"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={transition}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-6">
              {/* — rating — */}
              <fieldset>
                <legend className="data-label text-talc-deep">Your rating</legend>
                <div
                  className="mt-3 flex items-center gap-1"
                  onMouseLeave={() => setHovered(0)}
                >
                  {[1, 2, 3, 4, 5].map((value) => {
                    const filled = value <= (hovered || rating)
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-pressed={rating === value}
                        onMouseEnter={() => setHovered(value)}
                        onFocus={() => setHovered(value)}
                        onBlur={() => setHovered(0)}
                        onClick={() => setRating(value)}
                        className="rounded p-1"
                      >
                        <Star
                          className={cn(
                            "size-7 transition-colors",
                            filled
                              ? "fill-barbicide-ink text-barbicide-ink"
                              : "fill-transparent text-talc",
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
                {errors.rating && (
                  <p className="mt-2 text-sm text-betel">{errors.rating}</p>
                )}
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="authorName">Name</Label>
                  <Input id="authorName" name="authorName" autoComplete="name" />
                  {errors.authorName && (
                    <p className="text-sm text-betel">{errors.authorName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="authorEmail">Email</Label>
                  <Input
                    id="authorEmail"
                    name="authorEmail"
                    type="email"
                    autoComplete="email"
                  />
                  <p className="text-[13px] text-talc-deep">
                    Not shown on the site.
                  </p>
                  {errors.authorEmail && (
                    <p className="text-sm text-betel">{errors.authorEmail}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comment">Your review</Label>
                <Textarea id="comment" name="comment" rows={4} />
                {errors.comment && (
                  <p className="text-sm text-betel">{errors.comment}</p>
                )}
              </div>

              {/* Honeypot — hidden from people, catnip for bots. */}
              <div aria-hidden className="hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-barbicide px-6 py-3.5 font-display text-[16px] font-bold lowercase text-nape transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {isPending ? "posting…" : "post review"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
