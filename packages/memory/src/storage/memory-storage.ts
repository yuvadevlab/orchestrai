/**
 * @file packages/memory/src/storage/memory-storage.ts
 * @description Thread-safe, in-memory implementation of IMemoryStorage with vector search.
 */

import type {
  IMemoryStorage,
  MemoryFilter,
  MemoryItem,
  MemorySearchQuery,
  ScoredMemoryItem,
} from "../contracts";
import { calculateCosineSimilarity } from "./vector-math";

/**
 * Ephemeral in-memory memory storage adapter for local development, unit testing, and benchmarking.
 */
export class MemoryStorageAdapter implements IMemoryStorage {
  private readonly items = new Map<string, MemoryItem>();

  public async save(item: MemoryItem): Promise<void> {
    this.items.set(item.memoryId, { ...item });
  }

  public async saveBatch(items: readonly MemoryItem[]): Promise<void> {
    for (const item of items) {
      this.items.set(item.memoryId, { ...item });
    }
  }

  public async getById(memoryId: string): Promise<MemoryItem | null> {
    const item = this.items.get(memoryId);
    return item ? { ...item } : null;
  }

  public async search(query: MemorySearchQuery): Promise<ScoredMemoryItem[]> {
    const results: ScoredMemoryItem[] = [];

    for (const item of this.items.values()) {
      // 1. Tenant boundary enforcement
      if (item.tenantId !== query.tenantId) {
        continue;
      }

      // 2. Optional agent boundary
      if (query.agentId && item.agentId !== query.agentId) {
        continue;
      }

      // 3. Optional memory type filter
      if (query.memoryTypes && !query.memoryTypes.includes(item.memoryType)) {
        continue;
      }

      // 4. Vector similarity calculation (if both vectors provided)
      const score =
        query.embedding && item.embedding
          ? calculateCosineSimilarity(query.embedding, item.embedding)
          : item.content.toLowerCase().includes(query.query.toLowerCase())
            ? 0.8
            : 0.0;

      // 5. Score threshold filter
      if (score >= query.minScore) {
        results.push({ item: { ...item }, score });
      }
    }

    // Sort descending by relevance score and cap at limit
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.limit);
  }

  public async list(filter: MemoryFilter): Promise<MemoryItem[]> {
    const matches: MemoryItem[] = [];

    for (const item of this.items.values()) {
      if (item.tenantId !== filter.tenantId) continue;
      if (filter.agentId && item.agentId !== filter.agentId) continue;
      if (filter.conversationId && item.conversationId !== filter.conversationId) continue;
      if (filter.memoryTypes && !filter.memoryTypes.includes(item.memoryType)) continue;
      if (filter.since && new Date(item.createdAt) < new Date(filter.since)) continue;

      matches.push({ ...item });
    }

    // Sort descending by createdAt
    matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return matches.slice(filter.offset, filter.offset + filter.limit);
  }

  public async delete(memoryId: string): Promise<boolean> {
    return this.items.delete(memoryId);
  }

  public async deleteByFilter(filter: MemoryFilter): Promise<number> {
    const toDelete = await this.list({ ...filter, limit: 1000, offset: 0 });
    let count = 0;
    for (const item of toDelete) {
      if (this.items.delete(item.memoryId)) {
        count++;
      }
    }
    return count;
  }

  public async pruneExpired(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [id, item] of this.items.entries()) {
      if (item.expiresAt && new Date(item.expiresAt) < now) {
        this.items.delete(id);
        count++;
      }
    }

    return count;
  }
}
