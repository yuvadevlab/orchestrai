/**
 * @file packages/regex/src/security.regex.ts
 * @description Regular expressions for detecting credentials, secrets, tokens, and sensitive system files.
 * @module @orchestrai/regex
 */

/**
 * Secret tokens, API keys, credentials, and PII patterns paired with their redaction replacements.
 */
export const SECRET_REDACTION_PATTERNS: readonly [RegExp, string][] = [
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
  // Email addresses
  [/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "[EMAIL_REDACTED]"],
];

/**
 * High-risk credential and authentication token file paths (Critical security risk).
 */
export const CRITICAL_CREDENTIAL_PATTERNS: readonly RegExp[] = [
  /[\\/]\.ssh([\\/]|$)/i,
  /[\\/]\.aws([\\/]|$)/i,
  /[\\/]\.gnupg([\\/]|$)/i,
  /[\\/]\.config[\\/]gcloud([\\/]|$)/i,
  /[\\/]\.azure([\\/]|$)/i,
  /[\\/]\.kube([\\/]config)?$/i,
  /[\\/]id_(rsa|ed25519|ecdsa|dsa)(\.pub)?$/i,
  /\.(pem|key|pkcs12|pfx)$/i,
  /^\/(etc[\\/](shadow|passwd|sudoers)|System[\\/]|private[\\/])/i,
];

/**
 * Environment variables and secret token files (Caution security risk).
 */
export const SECRET_CONFIG_PATTERNS: readonly RegExp[] = [
  /(^|[\\/])\.env(\.[a-zA-Z0-9_-]+)?$/i,
  /(^|[\\/])\.npmrc$/i,
  /(^|[\\/])\.dockercfg$/i,
  /(^|[\\/])\.docker[\\/]config\.json$/i,
  /(^|[\\/])credentials\.json$/i,
  /(^|[\\/])service-account.*\.json$/i,
];
