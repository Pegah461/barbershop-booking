import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Tonal chips: filled, small radius, mono so status codes read as codes.
  "inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-barbicide/20 text-barbicide-ink",
        secondary: "border-transparent bg-nape/[0.08] text-talc-deep",
        destructive: "border-transparent bg-betel/15 text-betel",
        outline: "border-nape/25 text-talc-deep",
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
