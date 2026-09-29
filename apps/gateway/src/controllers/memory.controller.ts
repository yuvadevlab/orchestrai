/**
 * @file apps/gateway/src/controllers/memory.controller.ts
 * @description HTTP controller mediating episodic and semantic memory management endpoints.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { memoryService } from "@/services/memory.service";

/**
 * Controller managing memory endpoints.
 */
export class MemoryController {
  /**
   * Lists stored memory records.
   */
  public async list(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const memories = await memoryService.listMemories(req.context.tenantId);
    sendJson(res, 200, { items: memories, total: (memories as unknown[]).length });
  }

  /**
   * Searches memories using semantic and relevance scoring.
   */
  public async search(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const body = (req.body || {}) as { query?: string };
    const query = String(body.query || "");
    const results = await memoryService.searchMemories(query, req.context.tenantId);
    sendJson(res, 200, { items: results, total: (results as unknown[]).length });
  }

  /**
   * Commits an explicit fact or semantic memory directly.
   */
  public async create(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const body = (req.body || {}) as {
      content?: string;
      importanceScore?: number;
      agentId?: string;
    };
    if (!body.content) {
      sendJson(res, 400, { error: { message: "Content is required" } });
      return;
    }
    await memoryService.storeFact(
      req.context.tenantId,
      body.agentId || "global",
      body.content,
      body.importanceScore ?? 0.7,
    );
    sendJson(res, 201, { success: true });
  }

  /**
   * Deletes a specific memory record by ID.
   */
  public async delete(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const memoryId = req.params?.id;
    if (!memoryId) {
      sendJson(res, 400, { error: { message: "Memory ID required" } });
      return;
    }
    const success = await memoryService.deleteMemory(memoryId);
    sendJson(res, 200, { success, memoryId });
  }
}
