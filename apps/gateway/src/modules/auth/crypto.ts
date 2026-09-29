/**
 * @file apps/gateway/src/services/crypto.ts
 * @description Enterprise-grade cryptographic hashing and HMAC session signing using Node.js crypto.
 * @module apps/gateway/services
 */

import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * Hashes a plain password with a cryptographically secure random salt using scrypt.
 * Format: `<salt_hex>:<hash_hex>`
 *
 * @param password - Plain text password
 * @returns Serialized salt and hash string
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plain password against a stored `<salt>:<hash>` string using constant-time comparison.
 *
 * @param password - Plain text password input
 * @param storedHash - Serialized stored hash
 * @returns True if password matches; false otherwise
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) {
      return false;
    }

    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = scryptSync(password, salt, KEY_LENGTH);

    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

/**
 * Session token claims structure.
 */
export interface TokenClaims {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Signs a payload into an HMAC-SHA256 bearer token.
 * Format: `orch_tok.<base64url_claims>.<base64url_signature>`
 *
 * @param claims - Token claims object
 * @param secret - Signing secret
 * @returns Signed bearer token string
 */
export function signToken(claims: TokenClaims, secret: string): string {
  const payloadStr = JSON.stringify(claims);
  const encodedPayload = Buffer.from(payloadStr).toString("base64url");
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `orch_tok.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a signed bearer token.
 *
 * @param token - Bearer token string
 * @param secret - Signing secret
 * @returns Verified TokenClaims or null if invalid/expired
 */
export function verifyToken(token: string, secret: string): TokenClaims | null {
  try {
    if (!token.startsWith("orch_tok.")) {
      return null;
    }

    const parts = token.slice("orch_tok.".length).split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, providedSignature] = parts;
    if (!encodedPayload || !providedSignature) {
      return null;
    }

    const expectedSignature = createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");

    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return null;
    }

    const decodedStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const claims = JSON.parse(decodedStr) as TokenClaims;

    // Verify token expiration (7-day default validity)
    if (Date.now() > claims.exp) {
      return null;
    }

    return claims;
  } catch {
    return null;
  }
}
