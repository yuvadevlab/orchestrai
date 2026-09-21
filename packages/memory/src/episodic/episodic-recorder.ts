/**
 * @file packages/memory/src/episodic/episodic-recorder.ts
 * @description Formats and commits execution run episodes into episodic memory items.
 */

import { MemoryType } from "@orchestrai/shared-types";
import type { IMemoryStorage, MemoryItem } from "../contracts";
import type { EpisodeRecord } from "./episode.types";

/**
 * Transforms discrete agent runs into episodic memory items for retrospective retrieval.
 */
export class EpisodicRecorder {
  private readonly storage: IMemoryStorage;

  constructor(storage: IMemoryStorage) {
    this.storage = storage;
  }

  /**
   * Encodes an episode record into narrative format and persists it into memory storage.
   *
   * @param episode - Structured summary of the finished execution.
   * @param embedding - Optional precomputed embedding vector.
   * @returns Persisted MemoryItem.
   */
  public async recordEpisode(episode: EpisodeRecord, embedding?: number[]): Promise<MemoryItem> {
    const narrative = [
      `Goal: ${episode.goal}`,
      `Outcome: ${episode.outcome}`,
      episode.actionsSummary.length > 0
        ? `Actions Taken:\n- ${episode.actionsSummary.join("\n- ")}`
        : null,
      episode.reflections ? `Reflection: ${episode.reflections}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const memoryItem: MemoryItem = {
      memoryId: episode.episodeId,
      tenantId: episode.tenantId,
      agentId: episode.agentId,
      conversationId: undefined,
      memoryType: MemoryType.EPISODIC,
      content: narrative,
      embedding,
      metadata: {
        executionId: episode.executionId,
        outcome: episode.outcome,
        actionsCount: episode.actionsSummary.length,
      },
      importanceScore: episode.outcome === "SUCCESS" ? 0.7 : 0.9, // Failures carry high learning value
      createdAt: episode.timestamp,
      updatedAt: episode.timestamp,
    };

    await this.storage.save(memoryItem);
    return memoryItem;
  }
}
