import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-nape/20 bg-strip px-3 py-2 text-[16px] text-nape caret-barbicide-ink transition-colors placeholder:text-talc-deep file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-nape hover:border-nape/35 focus-visible:border-barbicide-ink disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
