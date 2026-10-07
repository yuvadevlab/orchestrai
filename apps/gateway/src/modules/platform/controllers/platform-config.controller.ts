/**
 * @file apps/gateway/src/modules/platform/controllers/platform-config.controller.ts
 * @description HTTP controller for dynamic platform configuration, branding, and suggestions.
 * @module apps/gateway/modules/platform/controllers
 */

import { Logger } from "@yuva-devlab/logger";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import { sendJson } from "@/routes";
import { PlatformConfigService, platformConfigService } from "../services/platform-config.service";

/**
 * Controller handling platform configuration and suggestion endpoints.
 */
export class PlatformConfigController {
  private readonly logger = new Logger("PlatformConfigController");

  public constructor(private readonly service: PlatformConfigService = platformConfigService) {}

  /**
   * GET /api/v1/suggestions
   * Returns dynamic welcome starter suggestion chips.
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async getSuggestions(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("getSuggestions: retrieving dynamic suggestions chips");
    const suggestions = await this.service.getWelcomeSuggestions();
    sendJson(res, 200, suggestions);
  }

  /**
   * GET /api/v1/welcome
   * Returns dynamic welcome hero headline, subtitle, and starter chips.
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async getWelcome(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("getWelcome: retrieving dynamic welcome screen metadata");
    const meta = await this.service.getWelcomeMetadata();
    const suggestions = await this.service.getWelcomeSuggestions();
    sendJson(res, 200, { ...meta, suggestions });
  }

  /**
   * GET /api/v1/branding
   * Returns dynamic application branding metadata (brand name and version).
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async getBranding(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("getBranding: retrieving dynamic platform branding configuration");
    const branding = await this.service.getBrandingConfig();
    sendJson(res, 200, branding);
  }

  /**
   * GET /api/v1/tools/categories
   * Returns dynamic tool category descriptive blurbs.
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async getToolCategories(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("getToolCategories: retrieving dynamic tool category blurbs");
    const categories = await this.service.getToolCategoryBlurbs();
    sendJson(res, 200, categories);
  }

  /**
   * GET /api/v1/config/:namespace/:key
   * Returns a specific configuration value.
   *
   * @param req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async getConfig(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const namespace = req.params[ROUTE_PARAMS.NAMESPACE] ?? "";
    const key = req.params[ROUTE_PARAMS.KEY] ?? "";
    this.logger.info("getConfig: retrieving platform configuration", { namespace, key });

    const value = await this.service.getConfig(namespace, key, null);

    // Guard if configuration setting does not exist in store
    if (value === null) {
      this.logger.warn("getConfig: configuration entry not found", { namespace, key });
      sendJson(res, 404, { error: `Configuration '${namespace}:${key}' not found` });
      return;
    }

    sendJson(res, 200, { namespace, key, value });
  }

  /**
   * PUT /api/v1/config/:namespace/:key
   * Updates a configuration value in database.
   *
   * @param req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async setConfig(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const namespace = req.params[ROUTE_PARAMS.NAMESPACE] ?? "";
    const key = req.params[ROUTE_PARAMS.KEY] ?? "";
    const body = req.body as { value: unknown; description?: string };
    this.logger.info("setConfig: persisting configuration update", { namespace, key });

    await this.service.setConfig(namespace, key, body.value, body.description);
    sendJson(res, 200, { success: true, namespace, key });
  }
}
