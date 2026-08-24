import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A hairline-bordered box with registration marks at its four corners — the
 * signature frame of the Industry design system. Marks sit *outside* the box,
 * so a Blueprint needs a little breathing room from its neighbours.
 */
const Blueprint = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { invert?: boolean }
>(({ className, invert, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("blueprint", invert && "blueprint-invert", className)}
    {...props}
  >
    <i className="corner corner-tl" />
    <i className="corner corner-tr" />
    <i className="corner corner-bl" />
    <i className="corner corner-br" />
    {children}
  </div>
))
Blueprint.displayName = "Blueprint"

export { Blueprint }
