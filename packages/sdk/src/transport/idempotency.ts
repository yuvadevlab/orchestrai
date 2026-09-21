/**
 * @file packages/sdk/src/transport/idempotency.ts
 * @description Idempotency key generation preventing duplicate operations during network retries.
 */

import { generateNonce } from "@/security";

/**
 * Creates or formats an idempotency key for stateful mutation requests.
 *
 * @param explicitKey - Optional user-provided custom idempotency key
 * @returns Clean UUIDv4 idempotency key
 */
export function resolveIdempotencyKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim().length > 0) {
    return explicitKey.trim();
  }
  return generateNonce();
}
