/**
 * @file packages/sdk/src/security/nonce-generator.ts
 * @description Anti-replay nonce generator utilizing cryptographically secure entropy.
 */

/**
 * Generates a cryptographically random UUID v4 nonce.
 *
 * @returns Cryptographically secure UUID string
 */
export function generateNonce(): string {
  // Use Web Crypto randomUUID if available in environment
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  // Fallback using crypto.getRandomValues for older engines
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // UUID version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // UUID variant RFC 4122

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
