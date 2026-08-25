import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { ReviewForm } from "./ReviewForm"
import { Stars } from "./Stars"

export type PublicReviewItem = {
  id: string
  rating: number
  authorName: string
  comment: string | null
  createdAt: Date
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

/**
 * Reviews: the summary and rating breakdown, the form, then everything people
 * have written.
 *
 * Reviews publish on submission — see the note on the `PublicReview` model.
 */
export function ReviewsSection({ reviews }: { reviews: PublicReviewItem[] }) {
  const count = reviews.length
  const average =
    count === 0 ? 0 : reviews.reduce((sum, review) => sum + review.rating, 0) / count

  // 5 stars first, down to 1.
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const total = reviews.filter((review) => review.rating === stars).length
    return { stars, total, percent: count === 0 ? 0 : (total / count) * 100 }
  })

  return (
    <section id="reviews" className="scroll-mt-20 bg-card py-20 sm:py-24">
      <div className="mx-auto max-w-[1140px] px-5 sm:px-7">
        <Reveal>
          <p className="data-label text-talc-deep">Reviews</p>
          <h2 className="mt-3 max-w-[18ch]">what people say</h2>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
          {/* — the numbers — */}
          <Reveal className="rounded-lg bg-strip p-6">
            {count === 0 ? (
              <>
                <p className="font-display text-[22px] font-bold lowercase text-nape">
                  no reviews yet
                </p>
                <p className="mt-2 text-talc-deep">
                  Be the first to leave one.
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-[44px] font-medium leading-none tabular-nums text-nape">
                  {average.toFixed(1)}
                </p>
                <Stars rating={average} size={18} className="mt-3" />
                <p className="mt-2 text-[15px] text-talc-deep">
                  {count} review{count === 1 ? "" : "s"}
                </p>

                <ul className="mt-6 space-y-2">
                  {breakdown.map((row) => (
                    <li key={row.stars} className="flex items-center gap-3">
                      <span className="w-4 font-mono text-[13px] tabular-nums text-talc-deep">
                        {row.stars}
                      </span>
                      <span
                        aria-hidden
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-nape/10"
                      >
                        <span
                          className="block h-full rounded-full bg-barbicide-ink"
                          style={{ width: `${row.percent}%` }}
                        />
                      </span>
                      <span className="w-6 text-right font-mono text-[13px] tabular-nums text-talc-deep">
                        {row.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Reveal>

          {/* — the form — */}
          <Reveal>
            <ReviewForm />
          </Reveal>
        </div>

        {/* — what people wrote — */}
        {count > 0 && (
          <RevealGroup as="ul" className="mt-10 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <RevealItem as="li" key={review.id}>
                <article className="h-full rounded-lg bg-strip p-6">
                  <Stars rating={review.rating} />
                  {review.comment && (
                    <p className="mt-4 text-[17px] leading-relaxed text-nape/85">
                      {review.comment}
                    </p>
                  )}
                  <footer className="mt-5 flex items-baseline gap-2">
                    <span className="font-display text-[16px] font-bold lowercase text-nape">
                      {review.authorName}
                    </span>
                    <time
                      dateTime={review.createdAt.toISOString()}
                      className="font-mono text-[12px] tabular-nums text-talc-deep"
                    >
                      {DATE_FORMAT.format(review.createdAt)}
                    </time>
                  </footer>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
