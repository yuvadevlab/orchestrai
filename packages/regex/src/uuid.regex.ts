/**
 * @file packages/regex/src/uuid.regex.ts
 * @description Canonical UUID regular expressions and validation helpers.
 * @module @orchestrai/regex
 */

/**
 * Standard RFC-4122 UUID pattern matching case-insensitive 8-4-4-4-12 hex format.
 */
export const UUID_REGEX: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates whether a candidate string conforms to canonical UUID syntax.
 *
 * @param value - Candidate string to evaluate.
 * @returns True if value is a valid UUID, false otherwise.
 */
export function isUuid(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  return UUID_REGEX.test(value.trim());
}
