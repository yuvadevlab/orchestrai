/**
 * @file apps/gateway/src/controllers/resource-access.controller.ts
 * @description HTTP controller for generic Resources, Capabilities, Access Grants, and Clearance Decisions.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import {
  PermissionScope,
  QUERY_PARAMS,
  ROUTE_PARAMS,
  OperatorRole,
} from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { resourceAccessService } from "../services/resource-access.service";

const logger = loggerWithConfig(new Logger("ResourceAccessController"));

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
   * Lists available protected resources, optionally filtered by tenant.
   *
   * @param req - Inbound gateway HTTP request containing query URL params.
   * @param res - Outbound gateway HTTP response sending resource array.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listResources(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const tenantId = url.searchParams.get(QUERY_PARAMS.TENANT_ID) ?? undefined;
    logger.info("listResources: listing resources", { tenantId });

    // Retrieve declared system and tenant resources
    const resources = await resourceAccessService.listResources(tenantId);
    sendJson(res, 200, { data: resources });
  }

  /**
   * Lists all registered system capabilities.
   *
   * @param _req - Inbound gateway HTTP request.
   * @param res - Outbound gateway HTTP response sending capability list.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listCapabilities(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    logger.info("listCapabilities: listing system capabilities");
    // Fetch global capabilities registry
    const capabilities = await resourceAccessService.listCapabilities();
    sendJson(res, 200, { data: capabilities });
  }

  /**
   * Lists active access grants filtered by user or tenant.
   *
   * @param req - Inbound gateway HTTP request with query parameters.
   * @param res - Outbound gateway HTTP response sending grant records.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listGrants(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const userId = url.searchParams.get(QUERY_PARAMS.USER_ID) ?? undefined;
    const tenantId = url.searchParams.get(QUERY_PARAMS.TENANT_ID) ?? undefined;
    logger.info("listGrants: listing access grants", { userId, tenantId });

    // Fetch grant authorizations
    const grants = await resourceAccessService.listGrants(userId, tenantId);
    sendJson(res, 200, { data: grants });
  }

  /**
   * Revokes an existing access grant.
   *
   * @param req - Inbound gateway HTTP request containing grant ID in URL params.
   * @param res - Outbound gateway HTTP response confirming revocation.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async revokeGrant(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const grantId = req.params[ROUTE_PARAMS.ID] ?? "";
    const body = (req.body as RevokeGrantBody | undefined) ?? {};
    const revokedBy = body.revokedBy || OperatorRole.USER;
    logger.info("revokeGrant: revoking access grant", { grantId, revokedBy });

    // Revoke grant authorization in database
    const grant = await resourceAccessService.revokeGrant(grantId, revokedBy);
    sendJson(res, 200, { success: true, grant });
  }

  /**
   * Lists pending resource clearance approval requests.
   *
   * @param req - Inbound gateway HTTP request with query parameters.
   * @param res - Outbound gateway HTTP response delivering approval request list.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listRequests(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const userId = url.searchParams.get(QUERY_PARAMS.USER_ID) ?? undefined;
    const tenantId = url.searchParams.get(QUERY_PARAMS.TENANT_ID) ?? undefined;
    logger.info("listRequests: listing clearance approval requests", { userId, tenantId });

    // Query pending approval tickets
    const requests = await resourceAccessService.listRequests(userId, tenantId);
    sendJson(res, 200, { data: requests });
  }

  /**
   * Decides an approval request, granting or denying capability access.
   *
   * @param req - Inbound gateway HTTP request containing request ID param and decision body.
   * @param res - Outbound gateway HTTP response confirming decision.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async decideRequest(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const requestId = req.params[ROUTE_PARAMS.ID] ?? "";
    const body = (req.body as DecideRequestBody | undefined) ?? {};
    const granted = Boolean(body.granted);
    const scope = body.scope || PermissionScope.SESSION;
    const decidedBy = body.decidedBy || OperatorRole.OPERATOR;
    const sessionId = body.sessionId;

    logger.info("decideRequest: processing clearance decision", {
      requestId,
      decidedBy,
      granted,
      scope,
      sessionId,
    });

    // Execute decision transition and record clearance grant
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
