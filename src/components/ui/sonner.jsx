import React from "react";
import { Toaster as Sonner, toast } from "sonner";
import { useTheme } from "next-themes";

/**
 * JS version of the shadcn/ui Sonner toaster wrapper.
 * - Removes TypeScript types
 * - Keeps runtime behavior the same
 */
const Toaster = (props) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme} // Sonner accepts "light" | "dark" | "system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
