/**
 * @file packages/sdk/src/security/credential-sanitizer.ts
 * @description Masking and redaction utilities preventing credential leaks in logs and traces.
 */

const SENSITIVE_KEYS = new Set([
  "authorization",
  "x-api-key",
  "clientsecret",
  "apikey",
  "token",
  "secret",
  "password",
]);

/**
 * Redacts a raw secret string, displaying only leading/trailing characters.
 *
 * @param secret - Raw sensitive token or key
 * @returns Masked string representation (e.g. "sk-1...89ab")
 */
export function maskSecret(secret?: string): string {
  if (!secret) return "[NONE]";
  if (secret.length <= 8) return "[REDACTED]";
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}...${suffix}`;
}

/**
 * Sanitizes headers object by redacting authorization and api-key entries.
 *
 * @param headers - Outbound or inbound header records
 * @returns Sanitized clone safe for logging
 */
export function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.toLowerCase().replace(/[-_]/g, "");
    if (SENSITIVE_KEYS.has(normalized)) {
      sanitized[key] = maskSecret(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
