/**
 * @file apps/gateway/src/services/agent.service.ts
 * @description Domain service for managing agent registration, configuration, and inspection.
 */

import { randomUUID } from "node:crypto";
import type { CreateAgentDto, UpdateAgentDto, AgentFilterDto } from "@/validation";

export interface AgentRecord {
  agentId: string;
  tenantId: string;
  name: string;
  description?: string;
  mode: string;
  systemPrompt: string;
  modelConfig: unknown;
  enabledTools: string[];
  maxSteps: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentListResult {
  items: AgentRecord[];
  filter: AgentFilterDto;
  total: number;
  hasMore: boolean;
}

/**
 * Service managing agent definition lifecycle and configuration storage.
 */
export class AgentService {
  /**
   * Lists agents for a tenant.
   */
  public async listAgents(filter: AgentFilterDto, _tenantId: string): Promise<AgentListResult> {
    return {
      items: [],
      filter,
      total: 0,
      hasMore: false,
    };
  }

  /**
   * Registers a new agent definition.
   */
  public async createAgent(dto: CreateAgentDto, tenantId: string): Promise<AgentRecord> {
    const agentId = randomUUID();
    const now = new Date().toISOString();

    return {
      agentId,
      tenantId,
      name: dto.name,
      description: dto.description,
      mode: dto.mode,
      systemPrompt: dto.systemPrompt,
      modelConfig: dto.modelConfig,
      enabledTools: dto.enabledTools,
      maxSteps: dto.maxSteps,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Retrieves an agent by its identifier.
   */
  public async getAgentById(agentId: string, tenantId: string): Promise<AgentRecord> {
    const now = new Date().toISOString();
    return {
      agentId,
      tenantId,
      name: "Default Agent",
      description: "Default configured agent",
      mode: "auto",
      systemPrompt: "You are a helpful assistant.",
      modelConfig: { provider: "ollama", modelName: "qwen2.5:7b" },
      enabledTools: [],
      maxSteps: 25,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Updates an existing agent definition.
   */
  public async updateAgent(
    agentId: string,
    dto: UpdateAgentDto,
    tenantId: string,
  ): Promise<AgentRecord> {
    const existing = await this.getAgentById(agentId, tenantId);
    return {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
  }
}
