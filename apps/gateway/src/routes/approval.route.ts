/**
 * @file apps/gateway/src/routes/approval.route.ts
 * @description REST API routes for human-in-the-loop approval requests and decisions.
 */

import type { Router } from "./router";
import { ApprovalController } from "@/controllers";

/**
 * Registers approval ticket routes onto the gateway router.
 *
 * @param router - Gateway router instance
 * @param controller - Approval controller instance
 */
export function registerApprovalRoutes(
  router: Router,
  controller: ApprovalController = new ApprovalController(),
): void {
  router.get("/api/v1/approvals", (req, res) => controller.listApprovals(req, res));
  router.post("/api/v1/approvals/:id/resolve", (req, res) => controller.resolveApproval(req, res));
}
