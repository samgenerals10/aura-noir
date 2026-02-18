import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names safely.
 * - clsx handles conditional classes
 * - twMerge resolves Tailwind conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
