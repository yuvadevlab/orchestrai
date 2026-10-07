/**
 * @file apps/gateway/src/modules/platform/controllers/platform-command.controller.ts
 * @description HTTP controller for platform slash commands.
 * @module apps/gateway/modules/platform/controllers
 */

import { Logger } from "@yuva-devlab/logger";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import { sendJson } from "@/routes";
import {
  PlatformCommandService,
  platformCommandService,
  type UpsertCommandDto,
} from "../services/platform-command.service";

/**
 * Controller handling slash commands (/plan, /act, /chat, /auto, /clear, etc.).
 */
export class PlatformCommandController {
  private readonly logger = new Logger("PlatformCommandController");

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
    this.logger.info("listCommands: querying platform slash commands", { includeDisabled });

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
    this.logger.info("createCommand: creating slash command", { command: dto.command });

    // Commit command specification to database
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
    const commandId = req.params[ROUTE_PARAMS.ID] ?? "";
    const patch = req.body as Partial<UpsertCommandDto>;
    this.logger.info("updateCommand: updating slash command", { commandId });

    const result = await this.service.updateCommand(commandId, patch);

    // Guard against non-existent command ID
    if (!result) {
      this.logger.warn("updateCommand: target command not found", { commandId });
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
    const commandId = req.params[ROUTE_PARAMS.ID] ?? "";
    this.logger.info("deleteCommand: removing slash command", { commandId });

    const success = await this.service.deleteCommand(commandId);
    sendJson(res, 200, { success, commandId });
  }
}
