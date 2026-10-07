/**
 * @file apps/gateway/src/controllers/llm-model.controller.ts
 * @description HTTP controller for LLM model catalog operations.
 * @module apps/gateway/controllers
 */

import { sendJson, type GatewayRequest, type GatewayResponse } from "@/routes";
import { LlmModelService, type UpsertModelDto } from "../services/llm-model.service";
import { QUERY_PARAMS, ROUTE_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("LlmModelController"));

/**
 * Controller handling LLM Model endpoints.
 * Public reads for authenticated studio users; mutations are protected by route-level admin middleware.
 */
export class LlmModelController {
  public constructor(private readonly service: LlmModelService = new LlmModelService()) {}

  /**
   * Returns all available AI models, optionally filtered by providerId.
   *
   * @param req - Inbound gateway HTTP request containing query URL params.
   * @param res - Outbound gateway HTTP response sending model catalog array.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listModels(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Extract optional providerId query filter from URL
    const providerId =
      typeof req.url === "string"
        ? (new URL(req.url, "http://localhost").searchParams.get(QUERY_PARAMS.PROVIDER_ID) ??
          undefined)
        : undefined;

    logger.info("listModels: listing catalog models", { providerId });

    // Retrieve active models from platform catalog
    const result = await this.service.listModels(providerId);
    sendJson(res, 200, result);
  }

  /**
   * Registers a new AI model under a given provider.
   *
   * @param req - Inbound gateway HTTP request containing UpsertModelDto payload.
   * @param res - Outbound gateway HTTP response delivering created model entity (201 Created).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async createModel(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertModelDto;
    logger.info("createModel: registering model", {
      modelIdentifier: dto.modelIdentifier,
      name: dto.name,
      providerId: dto.providerId,
    });

    // Delegate creation to LlmModelService
    const result = await this.service.createModel(dto);
    sendJson(res, 201, result);
  }

  /**
   * Updates an existing model's parameters, capabilities, or enablement flag.
   *
   * @param req - Inbound gateway HTTP request containing modelId param and update patch body.
   * @param res - Outbound gateway HTTP response sending updated model definition.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async updateModel(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modelId = req.params[ROUTE_PARAMS.ID] ?? "";
    const dto = req.body as Partial<UpsertModelDto>;
    logger.info("updateModel: updating model definition", { modelId });

    // Apply update modifications
    const result = await this.service.updateModel(modelId, dto);
    sendJson(res, 200, result);
  }

  /**
   * Removes a model definition from the platform catalog.
   *
   * @param req - Inbound gateway HTTP request containing modelId param.
   * @param res - Outbound gateway HTTP response confirming deletion.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async deleteModel(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modelId = req.params[ROUTE_PARAMS.ID] ?? "";
    logger.info("deleteModel: deleting model from catalog", { modelId });

    // Remove model record from catalog
    await this.service.deleteModel(modelId);
    sendJson(res, 200, { success: true, modelId });
  }
}
