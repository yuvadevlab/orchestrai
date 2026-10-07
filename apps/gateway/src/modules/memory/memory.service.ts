/**
 * @file apps/gateway/src/services/memory.service.ts
 * @description Enterprise memory service coordinating working, episodic, and semantic recall for agents.
 * @module apps/gateway/services
 */

import { randomUUID } from "node:crypto";
import { MemoryManager, MemoryStorageAdapter, type EpisodeRecord } from "@orchestrai/memory";
import { MemoryType, EpisodeOutcome } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("MemoryService"));

export interface RecordExecutionEpisodeParams {
  readonly executionId: string;
  readonly tenantId: string;
  readonly agentId: string;
  readonly goal: string;
  readonly summary: string;
  readonly outcome: EpisodeOutcome | "SUCCESS" | "FAILURE" | "ABORTED";
  readonly toolsUsed: readonly string[];
  readonly durationMs: number;
}

/**
 * Service orchestrating cross-session agent episodic memory and semantic recall.
 */
export class MemoryService {
  private readonly manager: MemoryManager;

  constructor() {
    this.manager = new MemoryManager({
      storage: new MemoryStorageAdapter(),
      minRelevanceLength: 10,
    });
  }

  /**
   * Records a completed execution run into episodic memory.
   */
  public async recordExecutionEpisode(params: RecordExecutionEpisodeParams): Promise<void> {
    try {
      const episode: EpisodeRecord = {
        episodeId: randomUUID(),
        executionId: params.executionId,
        agentId: params.agentId,
        tenantId: params.tenantId,
        goal: params.goal,
        actionsSummary: [...params.toolsUsed],
        outcome: params.outcome,
        reflections: params.summary,
        timestamp: new Date().toISOString(),
      };

      await this.manager.recordEpisode(episode);
      logger.debug("Recorded execution episode in memory", {
        executionId: params.executionId,
        outcome: params.outcome,
      });
    } catch (err) {
      logger.warn("Failed to record execution episode", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Recalls relevant historical episodes and facts matching the current user instruction.
   *
   * @param queryText - User's current prompt
   * @param tenantId - Active tenant identifier
   * @param agentId - Active agent identifier
   * @returns Synthesized memory context text to inject into the agent's prompt
   */
  public async recallContext(
    queryText: string,
    tenantId: string,
    agentId?: string,
  ): Promise<string> {
    try {
      const memories = await this.manager.recall({
        tenantId,
        agentId,
        query: queryText,
        limit: 5,
        minScore: 0.3,
        memoryTypes: [
          MemoryType.EPISODIC,
          MemoryType.FACT,
          MemoryType.USER_PREFERENCE,
          MemoryType.TASK,
        ],
      });

      if (memories.length === 0) {
        return "";
      }

      const memoryLines = memories.map(
        (m, i) => `[Prior Memory ${i + 1} (${m.item.memoryType})]: ${m.item.content}`,
      );

      return `\n\n[Relevant Prior Learnings & Experiences]:\n${memoryLines.join("\n")}`;
    } catch (err) {
      logger.debug("Failed to recall memories for context", {
        error: err instanceof Error ? err.message : String(err),
      });
      return "";
    }
  }

  /**
   * Commits an explicit fact or semantic note to memory.
   */
  public async storeFact(
    tenantId: string,
    agentId: string,
    content: string,
    importanceScore = 0.7,
  ): Promise<void> {
    await this.manager.remember({
      tenantId,
      agentId,
      memoryType: MemoryType.FACT,
      content,
      importanceScore,
    });
  }

  /**
   * Lists stored memory records.
   */
  public async listMemories(tenantId = "default", limit = 100): Promise<unknown[]> {
    return this.manager.list({ tenantId, limit, offset: 0 });
  }

  /**
   * Deletes a specific memory record by ID.
   */
  public async deleteMemory(memoryId: string): Promise<boolean> {
    return this.manager.delete(memoryId);
  }

  /**
   * Searches memories using semantic and relevance scoring.
   */
  public async searchMemories(query: string, tenantId = "default", limit = 10): Promise<unknown[]> {
    return this.manager.recall({
      tenantId,
      query,
      limit,
      minScore: 0.1,
    });
  }
}

export const memoryService = new MemoryService();
