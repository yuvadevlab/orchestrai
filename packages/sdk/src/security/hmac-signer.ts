/**
 * @file packages/sdk/src/security/hmac-signer.ts
 * @description Standard Web Crypto HMAC-SHA256 request signing and payload integrity calculator.
 */

import type { SignedRequestHeaders } from "@/types";
import { generateNonce } from "./nonce-generator";

/**
 * Converts ArrayBuffer into lowercase hexadecimal representation.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Computes SHA-256 digest of payload string using standard Web Crypto API.
 */
export async function computeContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

/**
 * Signs an outbound HTTP request using HMAC-SHA256.
 *
 * @param method - HTTP verb (e.g. GET, POST)
 * @param path - URL path and query string (e.g. /api/v1/executions)
 * @param body - Serialized request body string, or empty string if none
 * @param clientId - Public enterprise client ID
 * @param clientSecret - Private cryptographic signing key
 * @returns Cryptographic signed headers guarding against tampering and replay attacks
 */
export async function signRequest(
  method: string,
  path: string,
  body: string,
  clientId: string,
  clientSecret: string,
): Promise<SignedRequestHeaders> {
  const encoder = new TextEncoder();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();
  const contentHash = await computeContentHash(body);

  // Canonical String to Sign: METHOD\nPATH\nTIMESTAMP\nNONCE\nCONTENT_HASH
  const canonicalString = [method.toUpperCase(), path, timestamp, nonce, contentHash].join("\n");

  const keyData = encoder.encode(clientSecret);
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(canonicalString),
  );

  const signature = bufferToHex(signatureBuffer);

  return {
    "x-orchestrai-client-id": clientId,
    "x-orchestrai-timestamp": timestamp,
    "x-orchestrai-nonce": nonce,
    "x-orchestrai-signature": signature,
    "x-orchestrai-content-hash": contentHash,
  };
}
