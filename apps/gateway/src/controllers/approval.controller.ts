/**
 * @file apps/gateway/src/controllers/approval.controller.ts
 * @description HTTP controller mediating human approval queries and operator decision resolutions.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { ApprovalFilterSchema, ResolveApprovalSchema } from "@/validation";
import { ApprovalService } from "@/services";

/**
 * Controller managing approval tickets and resolutions.
 */
export class ApprovalController {
  constructor(private readonly service: ApprovalService = new ApprovalService()) {}

  /**
   * Lists approval requests.
   */
  public async listApprovals(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const query = ApprovalFilterSchema.parse(parseQueryParams(req.url));
    const result = await this.service.listApprovals(query, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Submits an operator verdict on an approval ticket.
   */
  public async resolveApproval(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const approvalId = req.params.id || "";
    const dto = ResolveApprovalSchema.parse(req.body);
    const decidedBy = req.context.userId || "operator";
    const result = await this.service.resolveApproval(approvalId, dto, decidedBy);
    sendJson(res, 200, result);
  }
}
