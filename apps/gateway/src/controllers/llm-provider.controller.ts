/**
 * @file apps/gateway/src/controllers/llm-provider.controller.ts
 * @description HTTP controller for LLM provider registry operations.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { LlmProviderService, type UpsertProviderDto } from "@/services/llm-provider.service";

/**
 * Controller handling LLM Provider endpoints.
 * Public reads for authenticated studio users; mutations are protected by route-level admin middleware.
 */
export class LlmProviderController {
  public constructor(private readonly service: LlmProviderService = new LlmProviderService()) {}

  /**
   * GET /api/v1/providers
   * Returns all active and configured LLM providers with associated model counts.
   */
  public async listProviders(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const result = await this.service.listProviders();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/providers
   * Registers a new LLM provider in the platform catalog.
   */
  public async createProvider(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertProviderDto;
    const result = await this.service.createProvider(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/providers/:id
   * Updates an existing LLM provider by identifier.
   */
  public async updateProvider(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const providerId = req.params.id ?? "";
    const dto = req.body as Partial<UpsertProviderDto>;
    const result = await this.service.updateProvider(providerId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/providers/:id
   * Removes an LLM provider and cascades to associated model catalog rows.
   */
  public async deleteProvider(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const providerId = req.params.id ?? "";
    await this.service.deleteProvider(providerId);
    sendJson(res, 200, { success: true, providerId });
  }
}
