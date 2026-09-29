/**
 * @file apps/console/src/lib/storage/indexed-db-storage.ts
 * @description Asynchronous IndexedDB storage engine wrapper for Zustand state persistence.
 * Replaces synchronous 5MB localStorage with high-capacity indexed browser storage.
 * @module apps/console/lib/storage
 */

import { get, set, del } from "idb-keyval";
import type { StateStorage } from "zustand/middleware";

/**
 * In-memory fallback map when IndexedDB is not supported or restricted (SSR, privacy modes).
 */
const inMemoryFallback = new Map<string, string>();

/**
 * Checks whether IndexedDB API is accessible in the current browser window.
 */
function isIndexedDbAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

/**
 * High-capacity asynchronous state storage adapter implementing Zustand StateStorage.
 */
export const indexedDbStorage: StateStorage = {
  /**
   * Retrieves a stored state value by key from IndexedDB.
   */
  async getItem(name: string): Promise<string | null> {
    if (!isIndexedDbAvailable()) {
      return inMemoryFallback.get(name) ?? null;
    }

    try {
      const val = await get<string>(name);
      return val ?? null;
    } catch {
      return inMemoryFallback.get(name) ?? null;
    }
  },

  /**
   * Persists an item value by key into IndexedDB.
   */
  async setItem(name: string, value: string): Promise<void> {
    if (!isIndexedDbAvailable()) {
      inMemoryFallback.set(name, value);
      return;
    }

    try {
      await set(name, value);
    } catch {
      inMemoryFallback.set(name, value);
    }
  },

  /**
   * Removes a stored entry by key from IndexedDB.
   */
  async removeItem(name: string): Promise<void> {
    if (!isIndexedDbAvailable()) {
      inMemoryFallback.delete(name);
      return;
    }

    try {
      await del(name);
    } catch {
      inMemoryFallback.delete(name);
    }
  },
};
