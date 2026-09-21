/**
 * @file packages/memory/src/lifecycle/privacy-sanitizer.ts
 * @description Redacts sensitive tokens, credentials, and PII before persistence.
 */

const SECRET_PATTERNS: readonly [RegExp, string][] = [
  // Bearer tokens & JWTs
  [/Bearer\s+[A-Za-z0-9\-_.]+/gi, "Bearer [REDACTED]"],
  // OpenAI & generic API keys (sk-...)
  [/sk-[a-zA-Z0-9]{20,}/g, "sk-[REDACTED]"],
  // GitHub Personal Access Tokens (ghp_..., gho_...)
  [/gh[pous]_[a-zA-Z0-9]{36}/g, "gh*_[REDACTED]"],
  // AWS Access Key ID
  [/AKIA[0-9A-Z]{16}/g, "AKIA[REDACTED]"],
  // Passwords in URLs
  [/:\/\/([^:]+):([^@]+)@/g, "://$1:[REDACTED]@"],
  // Email addresses (optional masking)
  [/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "[EMAIL_REDACTED]"],
];

/**
 * Sanitizes memory payloads to protect secrets and confidential credentials from persistent storage.
 */
export class PrivacySanitizer {
  /**
   * Replaces known credential formats and private keys with redaction markers.
   *
   * @param input - Raw text to inspect.
   * @returns Sanitized text with redacted sensitive tokens.
   */
  public sanitize(input: string): string {
    let sanitized = input;

    for (const [pattern, replacement] of SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    return sanitized;
  }
}
