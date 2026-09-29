/**
 * @file apps/console/src/features/memory/types.ts
 * @description Type definitions for agent working, episodic, and semantic memory items.
 * @module apps/console/features/memory
 */

import { MemoryType } from "@orchestrai/shared-types";

export { MemoryType };

export interface MemoryItem {
  memoryId: string;
  tenantId: string;
  agentId: string;
  conversationId?: string;
  memoryType: MemoryType;
  content: string;
  importanceScore: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ScoredMemoryResult {
  item: MemoryItem;
  score: number;
}

export interface CreateMemoryPayload {
  content: string;
  agentId?: string;
  importanceScore?: number;
}
