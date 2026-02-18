/**
 * Converted from TypeScript → JavaScript on 2026-02-16.
 * NOTE: This is a UI library component (shadcn/ui). Comments are kept light to avoid clutter.
 */
import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark

export ChartConfig = {
  [k in string]: {
    label: React.ReactNode
    icon: React.ComponentType
  } & (
    | { color: string; theme: never }
    | { color: never; theme: Record<keyof typeof THEMES, string> }
  )
}