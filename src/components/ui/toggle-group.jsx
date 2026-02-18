/**
 * Toggle Group (shadcn/ui style) — JavaScript version
 *
 * WHAT THIS COMPONENT DOES
 * - It renders a group of toggle buttons (like a segmented control).
 * - Uses Radix UI Toggle Group under the hood for accessibility + keyboard behavior.
 * - Shares "variant" and "size" from the parent ToggleGroup to every ToggleGroupItem using React Context.
 *
 * WHERE IT’S CONNECTED TO
 * 1) "@radix-ui/react-toggle-group"
 *    - Provides <ToggleGroupPrimitive.Root> and <ToggleGroupPrimitive.Item>
 *    - Handles selection state, roving focus, aria attributes, etc.
 *
 * 2) "@/components/ui/toggle"
 *    - Exports `toggleVariants(...)` (a function that returns Tailwind classes)
 *    - ToggleGroupItem uses that function to style each toggle item consistently.
 *
 * 3) "@/lib/utils"
 *    - Exports `cn(...)` to merge Tailwind class strings safely.
 */

import * as React from "react"; // React runtime (hooks, forwardRef, createContext, etc.)
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"; // Radix toggle group building blocks

import { cn } from "@/lib/utils"; // helper: merges className strings nicely
import { toggleVariants } from "@/components/ui/toggle"; // styling factory used by items

/**
 * Context lets the parent pass down "variant" + "size" to all children items.
 * This avoids manually passing props to every ToggleGroupItem.
 *
 * default values are used only if someone renders an Item without a Provider
 * (normally ToggleGroup provides it).
 */
const ToggleGroupContext = React.createContext({
  size: "default",      // default size if nothing is provided
  variant: "default",   // default variant if nothing is provided
});

/**
 * ToggleGroup
 * - Wraps Radix's ToggleGroup Root
 * - Adds layout classes (horizontal or vertical)
 * - Optionally adds outline wrapper styling
 * - Provides context to children items
 */
const ToggleGroup = React.forwardRef(
  (
    {
      className,                 // extra Tailwind classes passed from where component is used
      variant = "default",       // style variant for the whole group (connects to toggleVariants in toggle.jsx)
      size = "default",          // size for the whole group (also connects to toggleVariants)
      orientation = "horizontal",// layout direction: horizontal by default
      children,                  // the ToggleGroupItem components inside this group
      ...props                   // remaining Radix props (type, value, defaultValue, onValueChange, etc.)
    },
    ref                         // forwarded ref so parent can access the DOM element (Radix root)
  ) => (
    /**
     * Radix Root: This is the actual toggle-group container Radix controls.
     * Any Radix toggle group props (single/multiple selection) are passed via {...props}.
     */
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(
        // Base layout: flex group
        "flex items-center gap-1",

        // Orientation controls flex direction
        orientation === "vertical" ? "flex-col" : "flex-row",

        // If outline variant: give the group a wrapper border & padding
        // This visually looks like a segmented control container.
        variant === "outline" &&
          "bg-background rounded-md border border-input p-1",

        // Finally merge caller-provided className
        className
      )}
      {...props}
    >
      {/*
        Provider passes group-level variant/size to all ToggleGroupItem children.
        This connects the parent props to items, so items don't need manual props.
      */}
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
);

// React displayName helps debugging in React DevTools
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

/**
 * ToggleGroupItem
 * - Wraps Radix Item
 * - Reads variant/size from context (set by ToggleGroup)
 * - Uses toggleVariants(...) from toggle.jsx to generate the right Tailwind classes
 */
const ToggleGroupItem = React.forwardRef(
  (
    {
      className,          // extra Tailwind classes for this item
      children,           // icon/text inside the toggle button
      variant,            // optional override per item (if you want one item different)
      size,               // optional override per item
      ...props            // Radix item props (value, disabled, etc.)
    },
    ref
  ) => {
    // Get group-level styling defaults from the parent ToggleGroup
    const context = React.useContext(ToggleGroupContext);

    return (
      /**
       * Radix Item: actual toggle button.
       * It controls state via data attributes like: data-state="on" | "off"
       */
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          /**
           * toggleVariants(...) returns the Tailwind styles for a toggle button.
           * - If ToggleGroup provided context.variant/context.size, we use those.
           * - If caller passes variant/size directly on the item, it can override.
           *
           * CONNECTION:
           * This calls the `toggleVariants` function in "@/components/ui/toggle"
           * which is where the styling rules live.
           */
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),

          /**
           * Extra styling for outline variant when ON:
           * Radix toggles add data-state="on".
           * This line depends on Radix adding that attribute.
           */
          context.variant === "outline" &&
            "data-[state=on]:bg-background data-[state=on]:text-foreground",

          // Merge caller-provided classes last
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    );
  }
);

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
