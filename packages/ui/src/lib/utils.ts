import { clsx, type ClassValue } from "clsx";

/**
 * Normalizes and combines class names safely.
 *
 * @param inputs - Class strings, conditional records, or arrays.
 * @returns A normalized class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
