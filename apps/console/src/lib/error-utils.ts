/**
 * @file apps/console/src/lib/error-utils.ts
 * @description Enterprise error formatting and normalization utilities converting network errors and API responses to user-friendly messages.
 * @module apps/console/lib
 */

import { UI_COPY } from "./ui-copy";

/**
 * Normalizes unknown exceptions, network errors, and API error payloads into clear, actionable UI messages.
 *
 * @param err - The caught error instance or response object
 * @param defaultFallback - Fallback message if no specific error can be deduced
 * @returns Human-friendly error description
 */
export function formatApiError(
  err: unknown,
  defaultFallback: string = UI_COPY.COMMON.API_ERRORS.DEFAULT_FALLBACK,
): string {
  // If no error provided, return fallback directly
  if (!err) {
    return defaultFallback;
  }

  // Handle string errors
  if (typeof err === "string") {
    const lower = err.toLowerCase();
    // Intercept generic browser network errors
    if (
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("fetch failed") ||
      lower.includes("load failed")
    ) {
      return UI_COPY.COMMON.API_ERRORS.NETWORK_CONNECTION;
    }
    return err;
  }

  // Handle Error instances
  if (err instanceof Error) {
    const msg = err.message || "";
    const lower = msg.toLowerCase();

    // Intercept native fetch TypeError or connection issues
    if (
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("fetch failed") ||
      lower.includes("load failed") ||
      lower.includes("econnrefused") ||
      lower.includes("err_connection_refused")
    ) {
      return UI_COPY.COMMON.API_ERRORS.AUTH_CONNECTION;
    }

    // Intercept JSON parsing errors from HTML error pages
    if (lower.includes("unexpected token") || lower.includes("not valid json")) {
      return UI_COPY.COMMON.API_ERRORS.INVALID_RESPONSE;
    }

    // Return the specific business error message if available
    if (msg.trim().length > 0) {
      return msg;
    }
  }

  // Handle generic error objects with message property
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }

  return defaultFallback;
}
