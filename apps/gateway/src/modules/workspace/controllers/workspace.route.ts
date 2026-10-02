/**
 * @file apps/gateway/src/modules/workspace/controllers/workspace.route.ts
 * @description REST API routes for workspace exploration, folder inspection, and file discovery.
 * @module apps/gateway/modules/workspace/controllers
 */

import type { RouteGroup } from "@/routes/router";
import { workspaceController, WorkspaceController } from "./workspace.controller";

/**
 * Registers workspace routes onto the gateway router scoped under /workspace.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Workspace controller instance
 */
export function registerWorkspaceRoutes(
  api: RouteGroup,
  controller: WorkspaceController = workspaceController,
): void {
  api.group("/workspace", (group) => {
    group.get("/files", (req, res) => controller.listFiles(req, res));
  });
}
