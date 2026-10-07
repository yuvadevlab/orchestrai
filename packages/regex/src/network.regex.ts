/**
 * @file packages/regex/src/network.regex.ts
 * @description Regular expressions for network address validation, private IP blocking, and CORS origins.
 * @module @orchestrai/regex
 */

/**
 * Regular expressions matching private, loopback, link-local, and unauthorized internal IP spaces.
 */
export const BLOCKED_IP_PATTERNS: readonly RegExp[] = [
  /^127\./, // IPv4 Loopback
  /^10\./, // RFC1918 private Class A
  /^172\.(1[6-9]|2\d|3[01])\./, // RFC1918 private Class B
  /^192\.168\./, // RFC1918 private Class C
  /^169\.254\./, // Link-local (cloud metadata endpoints)
  /^::1$/, // IPv6 loopback
  /^fc00:/, // IPv6 unique local
];

/**
 * Regular expression matching local development origins (localhost and 127.0.0.1 on any port).
 */
export const LOCALHOST_ORIGIN_REGEX: RegExp = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Regular expression validating IPv4 addresses.
 */
export const IPV4_REGEX: RegExp =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
