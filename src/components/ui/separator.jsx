/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * NOTE: This is a UI library component (shadcn/ui). Comments are kept light to avoid clutter.
 */
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"
const Separator = React.forwardRef(
  (
    { className, orientation = "horizontal", decorative = true, variant = "default", ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0",
        variant === "default" && "bg-border",
        variant === "muted" && "bg-muted",
        variant === "accent" && "bg-primary/30",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
