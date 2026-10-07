/**
 * @file apps/gateway/src/controllers/approval.controller.ts
 * @description HTTP controller mediating human approval queries and operator decision resolutions.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { ApprovalFilterSchema, ResolveApprovalSchema } from "@/validation";
import { ApprovalService } from "./approval.service";
import { ROUTE_PARAMS, OperatorRole } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("ApprovalController"));

/**
 * Controller managing approval tickets and resolutions with strict tenant boundary enforcement.
 */
export class ApprovalController {
  constructor(private readonly service: ApprovalService = new ApprovalService()) {}

  /**
   * Lists approval requests for the authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request containing tenant context and query filters.
   * @param res - Outbound gateway HTTP response sending list of approval tickets.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listApprovals(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Parse query criteria for pending or resolved tickets
    const query = ApprovalFilterSchema.parse(parseQueryParams(req.url));
    logger.info("listApprovals: querying approvals", {
      tenantId: req.context.tenantId,
      status: query.status,
      limit: query.limit,
    });

    // Delegate listing query to approval domain service
    const result = await this.service.listApprovals(query, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Submits an operator verdict on an approval ticket.
   *
   * @param req - Inbound gateway HTTP request containing approval ID and resolution status.
   * @param res - Outbound gateway HTTP response confirming resolution verdict.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async resolveApproval(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const approvalId = req.params[ROUTE_PARAMS.ID] || "";
    // Validate resolution verdict body
    const dto = ResolveApprovalSchema.parse(req.body);
    const decidedBy = req.context.userId || OperatorRole.OPERATOR;

    logger.info("resolveApproval: resolving approval ticket clearance", {
      approvalId,
      decidedBy,
      decision: dto.decision,
      tenantId: req.context.tenantId,
    });

    // Apply resolution decision and unblock paused workflow execution
    const result = await this.service.resolveApproval(approvalId, dto, decidedBy);
    sendJson(res, 200, result);
  }
}
