import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Read-only star display. Server-safe.
 *
 * The rating is announced once as text for assistive tech; the stars
 * themselves are decorative so a screen reader doesn't read out five icons.
 */
export function Stars({
  rating,
  size = 16,
  className,
}: {
  rating: number
  size?: number
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="sr-only">{rating} out of 5 stars</span>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden
          style={{ width: size, height: size }}
          className={cn(
            value <= Math.round(rating)
              ? "fill-barbicide-ink text-barbicide-ink"
              : "fill-transparent text-talc",
          )}
        />
      ))}
    </span>
  )
}
