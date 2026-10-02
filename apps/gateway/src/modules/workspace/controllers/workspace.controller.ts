/**
 * @file apps/gateway/src/modules/workspace/controllers/workspace.controller.ts
 * @description HTTP controller handling workspace file exploration and querying.
 * @module apps/gateway/modules/workspace/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { workspaceFileService } from "../services/workspace-file.service";
import { loggerWithConfig, Logger } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("Gateway.Workspace.Controller"));

/**
 * Controller mediating workspace file discovery and search requests.
 */
export class WorkspaceController {
  /**
   * Lists and filters files within a workspace directory.
   */
  public async listFiles(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      const params = parseQueryParams(req.url);
      const targetPath = typeof params.path === "string" ? params.path : undefined;
      const query = typeof params.query === "string" ? params.query : undefined;
      const limit = typeof params.limit === "string" ? parseInt(params.limit, 10) : 100;

      const files = await workspaceFileService.listFiles(
        targetPath,
        query,
        Number.isNaN(limit) ? 100 : limit,
      );

      sendJson(res, 200, { data: files, total: files.length });
    } catch (err) {
      logger.error("Failed to scan workspace files", err);
      sendJson(res, 500, {
        error: { code: "WORKSPACE_ERROR", message: "Failed to scan workspace files" },
      });
    }
  }
}

export const workspaceController = new WorkspaceController();
