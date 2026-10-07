/**
 * @file apps/gateway/src/controllers/agent.controller.ts
 * @description HTTP controller mediating agent registration, listing, and updates.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { CreateAgentSchema, UpdateAgentSchema, AgentFilterSchema } from "@/validation";
import { AgentService } from "../services/agent.service";
import { ErrorCode, HttpStatus, ROUTE_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("AgentController"));

/**
 * Controller managing agent configuration HTTP endpoints with strict tenancy isolation.
 */
export class AgentController {
  constructor(private readonly service: AgentService = new AgentService()) {}

  /**
   * Lists registered agent configurations for the authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request containing tenant context and query parameters.
   * @param res - Outbound gateway HTTP response delivering agent catalog list.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listAgents(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Validate and parse filtering criteria from URL query string
    const query = AgentFilterSchema.parse(parseQueryParams(req.url));
    logger.info("listAgents: listing tenant agents", {
      tenantId: req.context.tenantId,
      limit: query.limit,
    });

    // Query agents through domain service
    const result = await this.service.listAgents(query, req.context.tenantId);
    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Registers a new agent definition for the authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request containing agent configuration body.
   * @param res - Outbound gateway HTTP response sending created agent record (201 Created).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async createAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Validate input payload against CreateAgentSchema definition
    const dto = CreateAgentSchema.parse(req.body);
    logger.info("createAgent: registering new agent", {
      tenantId: req.context.tenantId,
      name: dto.name,
      mode: dto.mode,
    });

    // Delegate creation to domain service
    const result = await this.service.createAgent(dto, req.context.tenantId);
    sendJson(res, HttpStatus.CREATED, result);
  }

  /**
   * Retrieves an agent definition by its unique identifier.
   *
   * @param req - Inbound gateway HTTP request containing agent ID param and tenant context.
   * @param res - Outbound gateway HTTP response sending agent record or 404 error.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async getAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const agentId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("getAgent: fetching agent by id", {
      agentId,
      tenantId: req.context.tenantId,
    });

    // Fetch agent record isolated to tenant
    const result = await this.service.getAgentById(agentId, req.context.tenantId);

    // Guard: Return 404 if agent is missing or belongs to another tenant
    if (!result) {
      logger.warn("getAgent: agent not found", {
        agentId,
        tenantId: req.context.tenantId,
      });
      sendJson(res, HttpStatus.NOT_FOUND, {
        error: { code: ErrorCode.NOT_FOUND, message: `Agent ${agentId} not found` },
      });
      return;
    }

    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Updates an existing agent definition.
   *
   * @param req - Inbound gateway HTTP request containing agent ID and update payload.
   * @param res - Outbound gateway HTTP response delivering updated agent record.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async updateAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const agentId = req.params[ROUTE_PARAMS.ID] || "";
    // Validate update fields against UpdateAgentSchema
    const dto = UpdateAgentSchema.parse(req.body);
    logger.info("updateAgent: updating agent", {
      agentId,
      tenantId: req.context.tenantId,
    });

    // Execute update through domain service
    const result = await this.service.updateAgent(agentId, dto, req.context.tenantId);
    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Deletes an agent definition by identifier.
   *
   * @param req - Inbound gateway HTTP request containing agent ID.
   * @param res - Outbound gateway HTTP response confirming deletion.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async deleteAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const agentId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deleteAgent: removing agent", {
      agentId,
      tenantId: req.context.tenantId,
    });

    // Perform deletion scoped to tenant
    await this.service.deleteAgent(agentId, req.context.tenantId);
    sendJson(res, HttpStatus.OK, { success: true, agentId });
  }
}
