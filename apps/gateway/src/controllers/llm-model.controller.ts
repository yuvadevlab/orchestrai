/**
 * @file apps/gateway/src/controllers/llm-model.controller.ts
 * @description HTTP controller for LLM model catalog operations.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { LlmModelService, type UpsertModelDto } from "@/services/llm-model.service";

/**
 * Controller handling LLM Model endpoints.
 * Public reads for authenticated studio users; mutations are protected by route-level admin middleware.
 */
export class LlmModelController {
  public constructor(private readonly service: LlmModelService = new LlmModelService()) {}

  /**
   * GET /api/v1/models
   * Returns all available AI models, optionally filtered by ?providerId.
   */
  public async listModels(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const providerId =
      typeof req.url === "string"
        ? (new URL(req.url, "http://localhost").searchParams.get("providerId") ?? undefined)
        : undefined;
    const result = await this.service.listModels(providerId);
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/models
   * Registers a new AI model under a given provider.
   */
  public async createModel(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertModelDto;
    const result = await this.service.createModel(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/models/:id
   * Updates an existing model's parameters, capabilities, or enablement flag.
   */
  public async updateModel(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modelId = req.params.id ?? "";
    const dto = req.body as Partial<UpsertModelDto>;
    const result = await this.service.updateModel(modelId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/models/:id
   * Removes a model definition from the platform catalog.
   */
  public async deleteModel(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modelId = req.params.id ?? "";
    await this.service.deleteModel(modelId);
    sendJson(res, 200, { success: true, modelId });
  }
}
