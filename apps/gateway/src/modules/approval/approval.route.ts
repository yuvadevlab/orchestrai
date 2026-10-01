/**
 * @file apps/gateway/src/routes/approval.route.ts
 * @description REST API routes for human-in-the-loop approval requests and decisions.
 */

import type { RouteGroup } from "@/routes/router";
import { ApprovalController } from "./approval.controller";

/**
 * Registers approval ticket routes onto the gateway router scoped under /approvals.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Approval controller instance
 */
export function registerApprovalRoutes(
  api: RouteGroup,
  controller: ApprovalController = new ApprovalController(),
): void {
  api.group("/approvals", (group) => {
    group.get("/", (req, res) => controller.listApprovals(req, res));
    group.post("/:id/resolve", (req, res) => controller.resolveApproval(req, res));
  });
}
