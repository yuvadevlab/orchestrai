/**
 * Error classifier identifying transient versus fatal failures for retry decisions.
 *
 * @module @orchestrai/resilience/retry
 */

/** Known Node.js transient system error codes */
const TRANSIENT_SYS_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
]);

/** HTTP status codes that represent transient, retryable server conditions */
const RETRYABLE_HTTP_STATUSES = new Set([
  408, // Request Timeout
  429, // Too Many Requests / Rate Limited
  500, // Internal Server Error (often temporary in microservices)
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

/** Non-retryable HTTP client errors */
const FATAL_HTTP_STATUSES = new Set([
  400, // Bad Request
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
  405, // Method Not Allowed
  422, // Unprocessable Entity / Validation Error
]);

/**
 * Determines whether an error is transient and safe to retry.
 *
 * @param error - The captured error object or value
 * @returns True if the failure is classified as transient
 */
export function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  // Check standard Node.js error code
  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && TRANSIENT_SYS_CODES.has(code)) {
    return true;
  }

  // Check HTTP status code
  const status =
    (error as { status?: unknown }).status ?? (error as { statusCode?: unknown }).statusCode;

  if (typeof status === "number") {
    if (FATAL_HTTP_STATUSES.has(status)) {
      // Never retry terminal authentication or schema validation failures
      return false;
    }
    if (RETRYABLE_HTTP_STATUSES.has(status)) {
      return true;
    }
  }

  // Check error name conventions
  const name = (error as { name?: unknown }).name;
  if (typeof name === "string") {
    if (name === "RateLimitError" || name === "TimeoutError") {
      return true;
    }
    if (name === "ValidationError" || name === "AuthenticationError") {
      return false;
    }
  }

  // By default, unknown unexpected errors are treated as transient
  return true;
}

/**
 * Checks whether an error is explicitly fatal and should abort immediately.
 *
 * @param error - The captured error object or value
 * @returns True if the failure is permanently fatal
 */
export function isFatalError(error: unknown): boolean {
  return !isTransientError(error);
}
