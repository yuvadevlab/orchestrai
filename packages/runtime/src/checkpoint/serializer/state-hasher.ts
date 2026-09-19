/**
 * @file packages/runtime/src/checkpoint/serializer/state-hasher.ts
 * @description Deterministic SHA-256 state hashing utility for checkpoint integrity verification.
 */

import { createHash } from "node:crypto";

/**
 * Normalizes an arbitrary value into a deterministic, canonical JSON-compatible object with sorted keys.
 *
 * @param value - Value to normalize.
 * @returns Sorted structure suitable for hashing.
 */
function canonicalize(value: unknown): unknown {
  // Handle primitive null or non-object values directly
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Handle Date instances by ISO string
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle Array elements sequentially
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  // Handle Map entries sorted by stringified keys
  if (value instanceof Map) {
    const entries = Array.from(value.entries()).map(([k, v]) => [String(k), canonicalize(v)]);
    entries.sort((a, b) => (a[0]! < b[0]! ? -1 : 1));
    return entries;
  }

  // Handle Set values sorted by canonical representation
  if (value instanceof Set) {
    const items = Array.from(value.values()).map(canonicalize);
    items.sort();
    return items;
  }

  // Handle plain objects: sort keys alphabetically to ensure deterministic hash
  const record = value as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const result: Record<string, unknown> = {};

  for (const key of sortedKeys) {
    // Ignore undefined properties to match JSON stringify semantics
    if (record[key] !== undefined) {
      result[key] = canonicalize(record[key]);
    }
  }

  return result;
}

/**
 * Computes a deterministic SHA-256 checksum hex string for an arbitrary graph state object.
 *
 * @param state - The state object to hash.
 * @returns SHA-256 checksum string in hex format.
 */
export function calculateStateHash(state: unknown): string {
  const canonical = canonicalize(state);
  const json = JSON.stringify(canonical);
  return createHash("sha256").update(json).digest("hex");
}

/**
 * Verifies whether a state object matches a given expected SHA-256 checksum.
 *
 * @param state - The state object to verify.
 * @param expectedHash - Expected hex hash string.
 * @returns Boolean indicating whether the state integrity check passed.
 */
export function verifyStateHash(state: unknown, expectedHash: string): boolean {
  // Guard: Return false immediately on empty or missing hash strings
  if (!expectedHash) {
    return false;
  }
  return calculateStateHash(state) === expectedHash;
}
