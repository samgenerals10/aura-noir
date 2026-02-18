/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * NOTE: This is a UI library component (shadcn/ui). Comments are kept light to avoid clutter.
 */
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month,
        caption,
        caption_label,
        nav,
        nav_button
          buttonVariants({ variant: "outline", size),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous,
        nav_button_next,
        table,
        head_row,
        head_cell,
        row,
        cell)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day
          buttonVariants({ variant: "ghost", size),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:text-accent-foreground"
        ),
        day_range_end,
        day_selected,
        day_today,
        day_outside,
        day_disabled,
        day_range_middle,
        day_hidden,
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
