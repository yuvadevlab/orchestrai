/**
 * @file apps/gateway/src/modules/platform/controllers/platform-command.controller.ts
 * @description HTTP controller for platform slash commands.
 * @module apps/gateway/modules/platform/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import {
  PlatformCommandService,
  platformCommandService,
  type UpsertCommandDto,
} from "../services/platform-command.service";

/**
 * Controller handling slash commands (/plan, /act, /chat, /auto, /clear, etc.).
 */
export class PlatformCommandController {
  /**
   * Initializes the controller with the platform command service.
   *
   * @param service - PlatformCommandService instance (defaults to singleton)
   */
  public constructor(private readonly service: PlatformCommandService = platformCommandService) {}

  /**
   * GET /api/v1/commands
   * Returns all active platform slash commands, or all commands if includeDisabled=true.
   *
   * @param req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async listCommands(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Check if caller requested disabled commands (typically for admin control panel)
    const url = new URL(req.url ?? "/", "http://localhost");
    const includeDisabled = url.searchParams.get("includeDisabled") === "true";
    const result = await this.service.listCommands(includeDisabled);
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/commands
   * Registers a new platform slash command.
   *
   * @param req - Gateway HTTP request with UpsertCommandDto in body
   * @param res - Gateway HTTP response
   */
  public async createCommand(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertCommandDto;
    const result = await this.service.createCommand(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/commands/:id
   * Updates an existing slash command (e.g., toggles isEnabled or changes description).
   *
   * @param req - Gateway HTTP request with target command ID in params
   * @param res - Gateway HTTP response
   */
  public async updateCommand(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const commandId = req.params.id ?? "";
    const patch = req.body as Partial<UpsertCommandDto>;
    const result = await this.service.updateCommand(commandId, patch);

    // Guard against non-existent command ID
    if (!result) {
      sendJson(res, 404, { error: `Platform command '${commandId}' not found` });
      return;
    }

    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/commands/:id
   * Deletes a slash command definition.
   *
   * @param req - Gateway HTTP request with target command ID in params
   * @param res - Gateway HTTP response
   */
  public async deleteCommand(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const commandId = req.params.id ?? "";
    const success = await this.service.deleteCommand(commandId);
    sendJson(res, 200, { success, commandId });
  }
}
