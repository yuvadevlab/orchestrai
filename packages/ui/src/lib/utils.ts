import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class values and resolves conflicting Tailwind utilities.
 *
 * @param inputs - Class strings, conditional records, or arrays.
 * @returns A normalized class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
