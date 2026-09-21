/**
 * @file packages/memory/src/manager/memory-manager.ts
 * @description Master facade coordinating storage, working memory, episodic logs, and semantic retrieval.
 */

import crypto from "node:crypto";
import { MemoryType } from "@orchestrai/shared-types";
import type {
  IMemoryStorage,
  MemoryFilter,
  MemoryItem,
  MemorySearchQuery,
  ScoredMemoryItem,
} from "@/contracts";
import { ConversationWindow, type ConversationWindowConfig } from "@/conversation";
import { WorkingMemory } from "@/working";
import { EpisodicRecorder, type EpisodeRecord } from "@/episodic";
import { SemanticSearchEngine, type RankingWeights } from "@/semantic";
import {
  PrivacySanitizer,
  RelevanceFilter,
  RetentionManager,
  type RetentionPolicyMap,
} from "@/lifecycle";

/**
 * Options configuring the master MemoryManager facade.
 */
export interface MemoryManagerConfig {
  readonly storage: IMemoryStorage;
  readonly rankingWeights?: RankingWeights;
  readonly retentionPolicies?: RetentionPolicyMap;
  readonly minRelevanceLength?: number;
}

/**
 * Parameters for committing a new memory through the managed pipeline.
 */
export interface RememberParams {
  readonly tenantId: string;
  readonly agentId: string;
  readonly conversationId?: string;
  readonly memoryType: MemoryType;
  readonly content: string;
  readonly embedding?: number[];
  readonly importanceScore?: number;
  readonly metadata?: Record<string, unknown>;
  readonly skipRelevanceCheck?: boolean;
}

/**
 * Unified enterprise memory manager governing storage, retrieval, relevance, and lifecycle.
 */
export class MemoryManager {
  private readonly storage: IMemoryStorage;
  private readonly relevanceFilter: RelevanceFilter;
  private readonly privacySanitizer: PrivacySanitizer;
  private readonly retentionManager: RetentionManager;
  private readonly semanticSearch: SemanticSearchEngine;
  private readonly episodicRecorder: EpisodicRecorder;

  constructor(config: MemoryManagerConfig) {
    this.storage = config.storage;
    this.relevanceFilter = new RelevanceFilter(config.minRelevanceLength);
    this.privacySanitizer = new PrivacySanitizer();
    this.retentionManager = new RetentionManager(this.storage, config.retentionPolicies);
    this.semanticSearch = new SemanticSearchEngine(this.storage, config.rankingWeights);
    this.episodicRecorder = new EpisodicRecorder(this.storage);
  }

  /**
   * Evaluates, sanitizes, and records a memory entry into persistent storage.
   *
   * @param params - Payload parameters for the memory item.
   * @returns Persisted MemoryItem, or null if rejected by relevance filter.
   */
  public async remember(params: RememberParams): Promise<MemoryItem | null> {
    // 1. Relevance gate (guard against small-talk / trivial tokens)
    if (!params.skipRelevanceCheck && !this.relevanceFilter.isRelevant(params.content)) {
      return null;
    }

    // 2. Privacy sanitization (redact tokens, keys, credentials)
    const sanitizedContent = this.privacySanitizer.sanitize(params.content);

    // 3. Calculate lifecycle TTL expiration
    const now = new Date();
    const expiresAt = this.retentionManager.calculateExpiration(params.memoryType, now);

    const memoryItem: MemoryItem = {
      memoryId: crypto.randomUUID(),
      tenantId: params.tenantId,
      agentId: params.agentId,
      conversationId: params.conversationId,
      memoryType: params.memoryType,
      content: sanitizedContent,
      embedding: params.embedding,
      metadata: params.metadata ?? {},
      importanceScore: params.importanceScore ?? 0.5,
      expiresAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await this.storage.save(memoryItem);
    return memoryItem;
  }

  /**
   * Retrieves memories matching semantic vector query with composite multi-factor ranking.
   */
  public async recall(query: MemorySearchQuery): Promise<ScoredMemoryItem[]> {
    return this.semanticSearch.searchWithReranking(query);
  }

  /**
   * Deterministically lists memories matching standard metadata criteria.
   */
  public async list(filter: MemoryFilter): Promise<MemoryItem[]> {
    return this.storage.list(filter);
  }

  /**
   * Spawns a transient WorkingMemory scratchpad bound to an execution run.
   */
  public createWorkingMemory(
    executionId: string,
    tenantId: string,
    agentId: string,
  ): WorkingMemory {
    return new WorkingMemory(executionId, tenantId, agentId);
  }

  /**
   * Spawns a sliding-window conversational context buffer.
   */
  public createConversationWindow(config?: ConversationWindowConfig): ConversationWindow {
    return new ConversationWindow(config);
  }

  /**
   * Commits a finished execution episode to episodic memory.
   */
  public async recordEpisode(episode: EpisodeRecord, embedding?: number[]): Promise<MemoryItem> {
    return this.episodicRecorder.recordEpisode(episode, embedding);
  }

  /**
   * Purges all expired memory records across the backing store.
   */
  public async pruneExpired(): Promise<number> {
    return this.retentionManager.pruneExpiredMemories();
  }
}
