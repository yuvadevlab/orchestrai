/**
 * @file apps/gateway/src/modules/platform/controllers/platform-config.controller.ts
 * @description HTTP controller for dynamic platform configuration, branding, and suggestions.
 * @module apps/gateway/modules/platform/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { PlatformConfigService, platformConfigService } from "../services/platform-config.service";

/**
 * Controller handling platform configuration and suggestion endpoints.
 */
export class PlatformConfigController {
  public constructor(private readonly service: PlatformConfigService = platformConfigService) {}

  /**
   * GET /api/v1/suggestions
   * Returns dynamic welcome starter suggestion chips.
   */
  public async getSuggestions(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const suggestions = await this.service.getWelcomeSuggestions();
    sendJson(res, 200, suggestions);
  }

  /**
   * GET /api/v1/welcome
   * Returns dynamic welcome hero headline, subtitle, and starter chips.
   */
  public async getWelcome(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const meta = await this.service.getWelcomeMetadata();
    const suggestions = await this.service.getWelcomeSuggestions();
    sendJson(res, 200, { ...meta, suggestions });
  }

  /**
   * GET /api/v1/branding
   * Returns dynamic application branding metadata (brand name and version).
   */
  public async getBranding(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const branding = await this.service.getBrandingConfig();
    sendJson(res, 200, branding);
  }

  /**
   * GET /api/v1/tools/categories
   * Returns dynamic tool category descriptive blurbs.
   */
  public async getToolCategories(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const categories = await this.service.getToolCategoryBlurbs();
    sendJson(res, 200, categories);
  }

  /**
   * GET /api/v1/config/:namespace/:key
   * Returns a specific configuration value.
   */
  public async getConfig(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const namespace = req.params.namespace ?? "";
    const key = req.params.key ?? "";
    const value = await this.service.getConfig(namespace, key, null);

    if (value === null) {
      sendJson(res, 404, { error: `Configuration '${namespace}:${key}' not found` });
      return;
    }

    sendJson(res, 200, { namespace, key, value });
  }

  /**
   * PUT /api/v1/config/:namespace/:key
   * Updates a configuration value in database.
   */
  public async setConfig(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const namespace = req.params.namespace ?? "";
    const key = req.params.key ?? "";
    const body = req.body as { value: unknown; description?: string };

    await this.service.setConfig(namespace, key, body.value, body.description);
    sendJson(res, 200, { success: true, namespace, key });
  }
}
