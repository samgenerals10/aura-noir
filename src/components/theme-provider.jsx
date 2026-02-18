"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * ThemeProvider wrapper for next-themes.
 * - Works in React SPA (Vite) as well
 * - No TypeScript types in JS/JSX
 * - Keeps runtime behavior the same
 */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
