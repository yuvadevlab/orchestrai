/**
 * @file packages/memory/src/lifecycle/privacy-sanitizer.ts
 * @description Redacts sensitive tokens, credentials, and PII before persistence.
 */

import { SECRET_REDACTION_PATTERNS } from "@orchestrai/regex";

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

    for (const [pattern, replacement] of SECRET_REDACTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    return sanitized;
  }
}
