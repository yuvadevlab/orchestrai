/**
 * @file packages/tools/src/sandbox/network-allowlist.ts
 * @description Outbound network domain allowlist enforcing SSRF prevention.
 *
 * ─── SSRF in AI Agents (Learning Note) ───────────────────────────────
 * Server-Side Request Forgery (SSRF) occurs when an LLM generates a URL
 * targeting internal infrastructure (e.g. "http://169.254.169.254/" for
 * AWS metadata, or "http://localhost:6379" for Redis). Without a domain
 * allowlist, the agent can leak cloud credentials or exfiltrate data.
 *
 * This allowlist checks that:
 *   1. The protocol is HTTPS (or HTTP for localhost-only dev mode).
 *   2. The resolved hostname matches an explicitly allowlisted domain.
 * ─────────────────────────────────────────────────────────────────────
 */

import { OrchestrAIError } from "@orchestrai/core";

/** Built-in blocked private/link-local IP patterns preventing SSRF */
const BLOCKED_IP_PATTERNS: ReadonlyArray<RegExp> = [
  /^127\./, // Loopback
  /^10\./, // RFC1918 private A
  /^172\.(1[6-9]|2\d|3[01])\./, // RFC1918 private B
  /^192\.168\./, // RFC1918 private C
  /^169\.254\./, // Link-local (AWS metadata endpoint)
  /^::1$/, // IPv6 loopback
  /^fc00:/, // IPv6 unique local
];

/**
 * Validates an outbound URL against the configured domain allowlist.
 * Blocks private IPs, link-local ranges, and non-allowlisted domains.
 *
 * @param rawUrl - The URL string the tool intends to fetch.
 * @param allowedDomains - Explicit list of permitted domain suffixes.
 * @throws {OrchestrAIError} with code POLICY_VIOLATION if the URL is blocked.
 */
export function assertNetworkAllowed(rawUrl: string, allowedDomains: ReadonlyArray<string>): void {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new OrchestrAIError(
      `Invalid URL: "${rawUrl}" cannot be parsed`,
      "VALIDATION_ERROR",
      400,
      { rawUrl },
    );
  }

  const { hostname, protocol } = parsed;

  // Only allow HTTPS in production; HTTP permitted only for explicit localhost dev
  if (protocol !== "https:" && hostname !== "localhost" && hostname !== "127.0.0.1") {
    throw new OrchestrAIError(
      `Protocol "${protocol}" is not permitted. Only HTTPS is allowed for non-local hosts`,
      "POLICY_VIOLATION",
      403,
      { rawUrl, protocol },
    );
  }

  // Block known private/link-local IP ranges (SSRF prevention)
  const isBlockedIp = BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(hostname));
  if (isBlockedIp) {
    throw new OrchestrAIError(
      `Access to private or link-local IP "${hostname}" is blocked`,
      "POLICY_VIOLATION",
      403,
      { rawUrl, hostname },
    );
  }

  // Check hostname against allowlist (exact match or suffix match)
  if (allowedDomains.length > 0) {
    const permitted = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
    if (!permitted) {
      throw new OrchestrAIError(
        `Domain "${hostname}" is not in the network allowlist`,
        "POLICY_VIOLATION",
        403,
        { rawUrl, hostname, allowedDomains },
      );
    }
  }
}
