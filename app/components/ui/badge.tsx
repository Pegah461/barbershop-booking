import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Industry: tags are square, quiet, tonal — not pills.
  "inline-flex items-center border px-2.5 py-[3px] text-[11px] uppercase tracking-[0.08em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-100 text-brand-800",
        secondary:
          "border-transparent bg-[var(--neutral-200)] text-[var(--neutral-800)]",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        outline: "border-brand text-brand",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
