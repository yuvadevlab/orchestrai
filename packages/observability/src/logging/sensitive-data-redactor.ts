/**
 * @file packages/observability/src/logging/sensitive-data-redactor.ts
 * @description Recursive payload sanitizer redacting secrets, API keys, and private credentials.
 */

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /authorization/i,
  /private[_-]?key/i,
  /credit[_-]?card/i,
  /cvv/i,
  /ssn/i,
];

const BEARER_REGEX = /Bearer\s+([A-Za-z0-9-_.]+)/gi;

/**
 * Recursively redacts sensitive keys and values from arbitrary objects and records.
 *
 * @param data - Arbitrary data payload
 * @param depth - Current recursion depth guard
 * @returns Sanitized clone safe for telemetry publication and logging
 */
export function redactSensitiveData(data: unknown, depth: number = 0): unknown {
  if (depth > 8) return "[MAX_DEPTH]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Redact embedded Bearer tokens in text
    return data.replace(BEARER_REGEX, "Bearer [REDACTED]");
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = redactSensitiveData(value, depth + 1);
    }
  }

  return result;
}
