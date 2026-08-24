import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Industry design system: buttons are square wireframe objects — hairline
// border, condensed type, no radius, no shadow.
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap border font-heading text-sm font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-brand bg-brand text-primary-foreground hover:bg-brand-600 active:bg-brand-700",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-border bg-transparent hover:bg-foreground/[0.07] active:bg-foreground/[0.14]",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-foreground/10",
        ghost:
          "border-transparent bg-transparent text-brand hover:bg-brand/10 active:bg-brand/20",
        link: "border-transparent text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-11.5 px-4.5 text-[15px]",
        icon: "h-9 w-9 px-0",
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
