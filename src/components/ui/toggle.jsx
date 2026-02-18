/**
 * Toggle (shadcn/ui style) — JavaScript version
 *
 * WHAT THIS FILE DOES
 * - Exports:
 *   1) <Toggle /> component (single toggle button)
 *   2) toggleVariants(...) function (returns Tailwind class strings)
 *
 * WHERE IT’S CONNECTED TO
 * - Used by: ToggleGroupItem in "@/components/ui/toggle-group"
 *   ToggleGroupItem calls toggleVariants({ variant, size }) to style each item.
 *
 * - Powered by: "@radix-ui/react-toggle"
 *   Radix adds accessibility attributes + data-state="on/off".
 *
 * - Styled by: "class-variance-authority" (cva)
 *   Lets us define variants (variant + size) in one place.
 */

import * as React from "react"; // React runtime utilities + forwardRef
import * as TogglePrimitive from "@radix-ui/react-toggle"; // Radix toggle button
import { cva } from "class-variance-authority"; // Variant-based class generator

import { cn } from "@/lib/utils"; // Class merge helper

/**
 * toggleVariants(...)
 * - This is a FUNCTION created by `cva`.
 * - You call it like: toggleVariants({ variant: "outline", size: "sm" })
 * - It returns a string of Tailwind classes.
 *
 * CONNECTION:
 * - ToggleGroupItem uses this same function (shared styling).
 */
const toggleVariants = cva(
  // Base classes always applied
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    // Radix sets data-state="on" when toggled on
    "data-[state=on]:bg-accent/60 data-[state=on]:text-accent-foreground",
  {
    // Variants = options you can pass in at runtime
    variants: {
      // "variant" controls look/feel style
      variant: {
        default: "bg-transparent hover:bg-muted/60 hover:text-foreground",
        outline:
          "border border-input bg-transparent hover:bg-muted/60 hover:text-foreground",
        soft: "bg-muted/40 hover:bg-muted/60 hover:text-foreground",
      },

      // "size" controls height + padding
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },

    // Defaults when user doesn’t pass variant/size
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * <Toggle />
 * - Wrapper around Radix TogglePrimitive.Root
 * - Adds Tailwind classes from toggleVariants(...)
 * - Whatever props you pass in (pressed, onPressedChange, disabled, etc.)
 *   go directly to Radix.
 */
const Toggle = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      // Generate Tailwind classes from variants
      toggleVariants({ variant, size }),
      // Merge any custom classes passed in by caller
      className
    )}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
