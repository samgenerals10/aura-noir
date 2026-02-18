/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * NOTE: This is a UI library component (shadcn/ui). Comments are kept light to avoid clutter.
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary,
        destructive,
        outline,
        success,
        warning,
        info,
      },
      size
        default: "px-2.5 py-0.5 text-xs",
        sm,
        lg,
      },
    },
    defaultVariants
      variant: "default",
      size,
    },
  }
)
function Badge({ className, variant, size, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
