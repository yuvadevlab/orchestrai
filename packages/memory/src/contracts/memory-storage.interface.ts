/**
 * @file packages/memory/src/contracts/memory-storage.interface.ts
 * @description Storage contract for durable and ephemeral memory backends.
 */

import type { MemoryItem, ScoredMemoryItem } from "./memory-item.schema";
import type { MemoryFilter, MemorySearchQuery } from "./memory-query.schema";

/**
 * Common storage engine interface implemented by both memory and postgres adapters.
 */
export interface IMemoryStorage {
  /**
   * Persists a single memory record.
   *
   * @param item - Validated MemoryItem to persist.
   */
  save(item: MemoryItem): Promise<void>;

  /**
   * Persists multiple memory records in an atomic batch.
   *
   * @param items - Array of MemoryItems to persist.
   */
  saveBatch(items: readonly MemoryItem[]): Promise<void>;

  /**
   * Retrieves a single memory item by unique identifier.
   *
   * @param memoryId - UUID of the memory item.
   * @returns Found item or null if non-existent.
   */
  getById(memoryId: string): Promise<MemoryItem | null>;

  /**
   * Performs semantic vector search over memories.
   *
   * @param query - Search criteria and query embedding.
   * @returns Array of matching items ordered by descending similarity score.
   */
  search(query: MemorySearchQuery): Promise<ScoredMemoryItem[]>;

  /**
   * Deterministically lists memory records matching filter criteria.
   *
   * @param filter - Scoping parameters, types, and pagination.
   * @returns Array of matching MemoryItems.
   */
  list(filter: MemoryFilter): Promise<MemoryItem[]>;

  /**
   * Deletes a specific memory record by ID.
   *
   * @param memoryId - UUID of the item to delete.
   * @returns True if deleted, false if not found.
   */
  delete(memoryId: string): Promise<boolean>;

  /**
   * Deletes all memory items matching a structured filter.
   *
   * @param filter - Scoping parameters.
   * @returns Number of records deleted.
   */
  deleteByFilter(filter: MemoryFilter): Promise<number>;

  /**
   * Prunes all memory records whose expiresAt timestamp is in the past.
   *
   * @returns Count of pruned records.
   */
  pruneExpired(): Promise<number>;
}
