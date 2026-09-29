/**
 * @file apps/gateway/src/controllers/agent.controller.ts
 * @description HTTP controller mediating agent registration, listing, and updates.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { CreateAgentSchema, UpdateAgentSchema, AgentFilterSchema } from "@/validation";
import { AgentService } from "@/services";

/**
 * Controller managing agent configuration HTTP endpoints.
 */
export class AgentController {
  constructor(private readonly service: AgentService = new AgentService()) {}

  /**
   * Lists registered agent configurations.
   */
  public async listAgents(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const query = AgentFilterSchema.parse(parseQueryParams(req.url));
    const result = await this.service.listAgents(query, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Registers a new agent definition.
   */
  public async createAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = CreateAgentSchema.parse(req.body);
    const result = await this.service.createAgent(dto, req.context.tenantId);
    sendJson(res, 201, result);
  }

  /**
   * Retrieves an agent definition by identifier.
   */
  public async getAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const agentId = req.params.id || "";
    const result = await this.service.getAgentById(agentId, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Updates an existing agent definition.
   */
  public async updateAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const agentId = req.params.id || "";
    const dto = UpdateAgentSchema.parse(req.body);
    const result = await this.service.updateAgent(agentId, dto, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Deletes an agent definition by identifier.
   */
  public async deleteAgent(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const agentId = req.params.id || "";
    await this.service.deleteAgent(agentId, req.context.tenantId);
    sendJson(res, 200, { success: true, agentId });
  }
}
