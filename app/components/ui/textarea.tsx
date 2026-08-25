import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[110px] w-full resize-y rounded-md border border-nape/20 bg-strip px-3 py-2.5 text-[16px] text-nape caret-barbicide-ink transition-colors placeholder:text-talc-deep hover:border-nape/35 focus-visible:border-barbicide-ink disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
