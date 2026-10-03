/**
 * @file apps/gateway/src/modules/workspace/controllers/workspace.controller.ts
 * @description HTTP controller handling workspace file exploration and querying.
 * @module apps/gateway/modules/workspace/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { workspaceFileService } from "../services/workspace-file.service";
import { workspaceInstructionLoader, harnessSkillRegistry } from "@/modules/harness";
import { resolveMonorepoRoot } from "@/modules/streaming/workspace-tool-executor";
import { loggerWithConfig, Logger } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("Gateway.Workspace.Controller"));

/**
 * Controller mediating workspace file discovery, search requests, and harness context.
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

  /**
   * Retrieves discovered instructions, rules, and skills for a workspace directory.
   */
  public getHarnessContext(req: GatewayRequest, res: GatewayResponse): void {
    try {
      const params = parseQueryParams(req.url);
      const targetPath =
        typeof params.path === "string" && params.path.trim().length > 0
          ? params.path.trim()
          : harnessSkillRegistry.getWorkspaceRoot() || resolveMonorepoRoot();

      const context = workspaceInstructionLoader.loadContext(targetPath);
      harnessSkillRegistry.registerContext(context);

      sendJson(res, 200, {
        workspaceRoot: context.workspaceRoot,
        rootInstructionsCount: context.rootInstructions.length,
        rulesCount: context.rules.length,
        skillsCount: context.skills.length,
        rootInstructions: context.rootInstructions,
        rules: context.rules,
        skills: context.skills,
      });
    } catch (err) {
      logger.error("Failed to load workspace harness context", err);
      sendJson(res, 500, {
        error: { code: "HARNESS_ERROR", message: "Failed to load workspace harness context" },
      });
    }
  }
}

export const workspaceController = new WorkspaceController();
