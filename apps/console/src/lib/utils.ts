/**
 * @fileoverview Classname merging utilities for React Server and Client Components.
 * Adheres strictly to the 250-line maximum rule.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind and conditional CSS classnames safely in both Server and Client environments.
 *
 * @param inputs - List of class names, conditional records, or arrays.
 * @returns Merged deduplicated CSS class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
