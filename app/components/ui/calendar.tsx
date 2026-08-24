"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Industry design system: the month grid is a sheet of hairline-bordered
// cells in condensed type — square, flat, no rounding anywhere.
function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex w-full flex-col gap-2.5",
        month_caption: "relative flex w-full items-center justify-center pt-1",
        caption_label:
          "font-heading text-[17px] font-semibold tracking-[0.04em]",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 opacity-70 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 flex-1 pb-1 text-center font-heading text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/45",
        week: "mt-0.5 flex w-full gap-0.5",
        day: "relative flex-1 p-0 text-center focus-within:relative focus-within:z-20",
        day_button:
          "flex h-9 w-full items-center justify-center border border-border font-heading text-sm font-semibold transition-colors hover:bg-foreground/[0.07] aria-selected:opacity-100",
        selected:
          "[&>button]:border-brand-900 [&>button]:bg-brand-900 [&>button]:text-background [&>button]:hover:bg-brand-900",
        today: "[&>button]:border-brand [&>button]:text-brand",
        outside: "text-muted-foreground opacity-50",
        disabled:
          "opacity-30 [&>button]:pointer-events-none [&>button]:cursor-not-allowed",
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
