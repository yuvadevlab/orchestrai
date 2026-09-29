/**
 * @file apps/gateway/src/controllers/resource-access.controller.ts
 * @description HTTP controller for generic Resources, Capabilities, Access Grants, and Clearance Decisions.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { resourceAccessService } from "@/services/resource-access.service";
import { PermissionScope } from "@orchestrai/shared-types";

interface RevokeGrantBody {
  revokedBy?: string;
}

interface DecideRequestBody {
  granted?: boolean;
  scope?: PermissionScope;
  decidedBy?: string;
  sessionId?: string;
}

/**
 * Controller exposing REST endpoints for system-wide resources, access grants, and capabilities.
 */
export class ResourceAccessController {
  /**
   * GET /api/v1/resources
   */
  public async listResources(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const tenantId = url.searchParams.get("tenantId") ?? undefined;
    const resources = await resourceAccessService.listResources(tenantId);
    sendJson(res, 200, { data: resources });
  }

  /**
   * GET /api/v1/capabilities
   */
  public async listCapabilities(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const capabilities = await resourceAccessService.listCapabilities();
    sendJson(res, 200, { data: capabilities });
  }

  /**
   * GET /api/v1/grants
   */
  public async listGrants(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const userId = url.searchParams.get("userId") ?? undefined;
    const tenantId = url.searchParams.get("tenantId") ?? undefined;
    const grants = await resourceAccessService.listGrants(userId, tenantId);
    sendJson(res, 200, { data: grants });
  }

  /**
   * DELETE /api/v1/grants/:id
   */
  public async revokeGrant(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const grantId = req.params.id ?? "";
    const body = (req.body as RevokeGrantBody | undefined) ?? {};
    const revokedBy = body.revokedBy || "user";
    const grant = await resourceAccessService.revokeGrant(grantId, revokedBy);
    sendJson(res, 200, { success: true, grant });
  }

  /**
   * GET /api/v1/approval-requests
   */
  public async listRequests(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const userId = url.searchParams.get("userId") ?? undefined;
    const tenantId = url.searchParams.get("tenantId") ?? undefined;
    const requests = await resourceAccessService.listRequests(userId, tenantId);
    sendJson(res, 200, { data: requests });
  }

  /**
   * POST /api/v1/approval-requests/:id/decide
   */
  public async decideRequest(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const requestId = req.params.id ?? "";
    const body = (req.body as DecideRequestBody | undefined) ?? {};
    const granted = Boolean(body.granted);
    const scope = body.scope || PermissionScope.SESSION;
    const decidedBy = body.decidedBy || "operator";
    const sessionId = body.sessionId;

    const result = await resourceAccessService.decideRequest({
      requestId,
      decidedBy,
      granted,
      scope,
      sessionId,
    });

    sendJson(res, 200, { success: true, ...result });
  }
}
