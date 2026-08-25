import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Filled surfaces with a small radius. Case is deliberately NOT forced here —
// the customer side writes its labels in lowercase to match the display voice,
// while the admin panel keeps its own capitalisation.
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-display font-bold tracking-[-0.01em] transition-[background-color,transform,box-shadow] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-barbicide text-nape hover:bg-barbicide/90",
        destructive: "bg-betel text-strip hover:bg-betel/90",
        outline:
          "border border-nape/20 bg-transparent text-nape hover:border-nape/35 hover:bg-nape/[0.05]",
        secondary: "bg-nape/[0.07] text-nape hover:bg-nape/[0.12]",
        ghost: "text-barbicide-ink hover:bg-barbicide/10",
        link: "text-barbicide-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 text-[15px]",
        sm: "h-9 px-3 text-[14px]",
        lg: "h-12 px-6 text-[16px]",
        icon: "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
