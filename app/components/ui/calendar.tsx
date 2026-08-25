"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// The month grid, in the fade system: filled day cells with a small radius,
// dates in tabular mono so the columns line up, and the selected day carried
// on Barbicide.
function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex w-full flex-col gap-3",
        month_caption: "relative flex w-full items-center justify-center pt-1",
        caption_label:
          "font-display text-[17px] font-bold lowercase tracking-[-0.01em] text-nape",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 flex-1 pb-2 text-center font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-talc-deep",
        week: "mt-1 flex w-full gap-1",
        day: "relative flex-1 p-0 text-center focus-within:relative focus-within:z-20",
        day_button:
          "flex h-10 w-full items-center justify-center rounded-md font-mono text-[14px] tabular-nums text-nape transition-colors hover:bg-nape/[0.07] aria-selected:opacity-100",
        selected:
          "[&>button]:bg-barbicide [&>button]:text-nape [&>button]:font-medium [&>button]:hover:bg-barbicide",
        today: "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-barbicide-ink",
        outside: "text-talc-deep opacity-50",
        disabled:
          "opacity-30 [&>button]:pointer-events-none [&>button]:cursor-not-allowed [&>button]:line-through",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, disabled, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...chevronProps} />
          ) : (
            <ChevronRight className="size-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
