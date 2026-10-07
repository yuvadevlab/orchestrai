/**
 * @file apps/gateway/src/modules/platform/controllers/llm-provider.controller.ts
 * @description HTTP controller for LLM provider registry operations.
 * @module apps/gateway/modules/platform/controllers
 */

import { Logger } from "@yuva-devlab/logger";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import { sendJson } from "@/routes";
import { LlmProviderService, type UpsertProviderDto } from "../services/llm-provider.service";

/**
 * Controller handling LLM Provider endpoints.
 * Public reads for authenticated studio users; mutations are protected by route-level admin middleware.
 */
export class LlmProviderController {
  private readonly logger = new Logger("LlmProviderController");

  public constructor(private readonly service: LlmProviderService = new LlmProviderService()) {}

  /**
   * GET /api/v1/providers
   * Returns all active and configured LLM providers with associated model counts.
   *
   * @param _req - Ingress gateway request context
   * @param res - HTTP response stream
   */
  public async listProviders(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("listProviders: fetching all configured LLM providers");
    // Fetch registered LLM providers from database
    const result = await this.service.listProviders();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/providers
   * Registers a new LLM provider in the platform catalog.
   *
   * @param req - Ingress gateway request containing new provider specification
   * @param res - HTTP response stream
   */
  public async createProvider(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertProviderDto;
    this.logger.info("createProvider: registering provider", { slug: dto.slug, name: dto.name });

    // Commit provider record to database
    const result = await this.service.createProvider(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/providers/:id
   * Updates an existing LLM provider by identifier.
   *
   * @param req - Ingress gateway request containing updated fields and route param
   * @param res - HTTP response stream
   */
  public async updateProvider(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const providerId = req.params[ROUTE_PARAMS.ID] ?? "";
    const dto = req.body as Partial<UpsertProviderDto>;
    this.logger.info("updateProvider: updating provider configuration", { providerId });

    // Apply updates to provider configuration
    const result = await this.service.updateProvider(providerId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/providers/:id
   * Removes an LLM provider and cascades to associated model catalog rows.
   *
   * @param req - Ingress gateway request containing provider identifier
   * @param res - HTTP response stream
   */
  public async deleteProvider(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const providerId = req.params[ROUTE_PARAMS.ID] ?? "";
    this.logger.info("deleteProvider: removing provider from platform", { providerId });

    // Execute provider deletion and cascade to associated models
    await this.service.deleteProvider(providerId);
    sendJson(res, 200, { success: true, providerId });
  }
}
