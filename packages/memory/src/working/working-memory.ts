/**
 * @file packages/memory/src/working/working-memory.ts
 * @description Ephemeral execution scratchpad maintaining transient variables and step outcomes.
 */

import { MemoryType } from "@orchestrai/shared-types";
import type { MemoryItem } from "../contracts";

/**
 * Working memory scratchpad scoped to an execution run or sub-agent routine.
 */
export class WorkingMemory {
  private readonly executionId: string;
  private readonly tenantId: string;
  private readonly agentId: string;
  private readonly storage = new Map<string, unknown>();
  private readonly ttlMs: number;
  private readonly createdAt: Date;

  constructor(executionId: string, tenantId: string, agentId: string, ttlMs = 86_400_000) {
    this.executionId = executionId;
    this.tenantId = tenantId;
    this.agentId = agentId;
    this.ttlMs = ttlMs;
    this.createdAt = new Date();
  }

  /**
   * Sets a named variable in the working memory scratchpad.
   */
  public set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  /**
   * Retrieves a named variable from the scratchpad.
   */
  public get<T>(key: string): T | undefined {
    return this.storage.get(key) as T | undefined;
  }

  /**
   * Checks if a variable key exists.
   */
  public has(key: string): boolean {
    return this.storage.has(key);
  }

  /**
   * Removes a variable key from the scratchpad.
   */
  public delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Returns all current working memory entries as a plain object.
   */
  public snapshot(): Record<string, unknown> {
    return Object.fromEntries(this.storage.entries());
  }

  /**
   * Clears all working memory state.
   */
  public clear(): void {
    this.storage.clear();
  }

  /**
   * Serializes the working memory scratchpad into a standard MemoryItem.
   */
  public toMemoryItem(memoryId: string): MemoryItem {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ttlMs).toISOString();

    return {
      memoryId,
      tenantId: this.tenantId,
      agentId: this.agentId,
      conversationId: undefined,
      memoryType: MemoryType.WORKING,
      content: JSON.stringify(this.snapshot()),
      metadata: { executionId: this.executionId },
      importanceScore: 0.2,
      expiresAt,
      createdAt: this.createdAt.toISOString(),
      updatedAt: now.toISOString(),
    };
  }
}
