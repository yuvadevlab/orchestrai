/**
 * @file apps/gateway/src/modules/workspace/controllers/workspace.controller.ts
 * @description HTTP controller handling workspace file exploration and querying.
 * @module apps/gateway/modules/workspace/controllers
 */

import { sendJson, parseQueryParams, type GatewayRequest, type GatewayResponse } from "@/routes";
import { workspaceFileService } from "../services/workspace-file.service";
import { workspaceInstructionLoader, harnessSkillRegistry } from "@/modules/harness";
import { resolveMonorepoRoot } from "@/modules/streaming/workspace-tool-executor";
import { ErrorCode, QUERY_PARAMS } from "@orchestrai/shared-types";
import { loggerWithConfig, Logger } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("WorkspaceController"));

/**
 * Controller mediating workspace file discovery, search requests, and harness context.
 */
export class WorkspaceController {
  /**
   * Lists and filters files within a workspace directory.
   *
   * @param req - Inbound gateway HTTP request containing search query and target path.
   * @param res - Outbound gateway HTTP response sending file entry metadata array.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listFiles(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      // Parse query string parameters for directory filtering
      const params = parseQueryParams(req.url);
      const targetPath =
        typeof params[QUERY_PARAMS.PATH] === "string" ? params[QUERY_PARAMS.PATH] : undefined;
      const query =
        typeof params[QUERY_PARAMS.QUERY] === "string" ? params[QUERY_PARAMS.QUERY] : undefined;
      const rawLimit = params[QUERY_PARAMS.LIMIT];
      const limit = typeof rawLimit === "string" ? parseInt(rawLimit, 10) : 100;

      logger.info("listFiles: scanning workspace files", { targetPath, query, limit });

      // Scan directory entries via workspace file service
      const files = await workspaceFileService.listFiles(
        targetPath,
        query,
        Number.isNaN(limit) ? 100 : limit,
      );

      sendJson(res, 200, { data: files, total: files.length });
    } catch (err) {
      logger.error("listFiles: failed to scan workspace files", {
        error: err instanceof Error ? err.message : String(err),
      });
      sendJson(res, 500, {
        error: { code: ErrorCode.WORKSPACE_ERROR, message: "Failed to scan workspace files" },
      });
    }
  }

  /**
   * Retrieves discovered instructions, rules, and skills for a workspace directory.
   *
   * @param req - Inbound gateway HTTP request specifying workspace directory path.
   * @param res - Outbound gateway HTTP response returning discovered instructions and skills.
   */
  public getHarnessContext(req: GatewayRequest, res: GatewayResponse): void {
    try {
      // Parse parameters or fall back to active workspace root
      const params = parseQueryParams(req.url);
      const rawPath = params[QUERY_PARAMS.PATH];
      const targetPath =
        typeof rawPath === "string" && rawPath.trim().length > 0
          ? rawPath.trim()
          : harnessSkillRegistry.getWorkspaceRoot() || resolveMonorepoRoot();

      logger.info("getHarnessContext: loading workspace harness context", { targetPath });

      // Load AGENTS.md, rules, and skills context from disk
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
      logger.error("getHarnessContext: failed to load workspace harness context", {
        error: err instanceof Error ? err.message : String(err),
      });
      sendJson(res, 500, {
        error: {
          code: ErrorCode.HARNESS_ERROR,
          message: "Failed to load workspace harness context",
        },
      });
    }
  }
}

export const workspaceController = new WorkspaceController();
