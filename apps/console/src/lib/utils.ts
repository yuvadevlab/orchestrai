/**
 * @fileoverview Classname merging and string formatting utilities for React Components.
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

/**
 * Extracts clean uppercase initials from a full name or email (e.g. "John Doe" -> "JD").
 *
 * @param name - Full display name or email address
 * @param fallback - Default initials if name is missing
 * @returns Uppercase 1-2 character initials
 */
export function getInitials(name?: string | null, fallback = "OP"): string {
  if (!name || !name.trim()) {
    return fallback;
  }

  const clean = name.trim();
  const atIndex = clean.indexOf("@");
  const text = atIndex > -1 ? clean.slice(0, atIndex) : clean;
  const parts = text.split(/[\s._-]+/).filter((p) => p.length > 0);

  if (parts.length === 0) {
    return fallback;
  }

  const firstPart = parts[0] ?? "";
  if (parts.length === 1) {
    return firstPart.slice(0, 2).toUpperCase() || fallback;
  }

  const lastPart = parts[parts.length - 1] ?? "";
  const first = firstPart[0] ?? "";
  const last = lastPart[0] ?? "";
  return (first + last).toUpperCase() || fallback;
}
