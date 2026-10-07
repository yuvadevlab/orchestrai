/**
 * @file apps/gateway/src/modules/agent/services/agent.service.ts
 * @description Domain service for managing Agent CRUD operations against PostgreSQL.
 * Strictly database-driven — zero hardcoded default agents or automatic seeding.
 * @module apps/gateway/modules/agent
 */

import {
  getPrismaClient,
  type PrismaClient,
  type Prisma,
  type AgentMode,
} from "@orchestrai/database";
import { resolveDbTenantId } from "@/modules/tenant-resolver";
import type { CreateAgentDto, UpdateAgentDto, AgentFilterDto } from "@/validation";

export interface AgentRecord {
  agentId: string;
  tenantId: string | null;
  name: string;
  description: string | null;
  mode: string;
  systemPrompt: string | null;
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
 * Service managing agent definition lifecycle and configuration storage in PostgreSQL.
 */
export class AgentService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Lists all active agents for a tenant without any hardcoded synthetic defaults.
   */
  public async listAgents(filter: AgentFilterDto, tenantId: string): Promise<AgentListResult> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    const rows = await this.db.agent.findMany({
      where: { tenantId: resolvedTenantId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const items: AgentRecord[] = rows.map((a) => ({
      agentId: a.agentId,
      tenantId: a.tenantId,
      name: a.name,
      description: a.description,
      mode: a.mode.toLowerCase(),
      systemPrompt: a.systemPrompt,
      modelConfig: a.modelConfig,
      enabledTools: Array.isArray(a.enabledTools) ? (a.enabledTools as string[]) : [],
      maxSteps: a.maxSteps,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

    return { items, filter, total: items.length, hasMore: false };
  }

  /**
   * Creates a new agent record in PostgreSQL.
   */
  public async createAgent(dto: CreateAgentDto, tenantId: string): Promise<AgentRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    const row = await this.db.agent.create({
      data: {
        tenantId: resolvedTenantId,
        name: dto.name,
        description: dto.description,
        mode: (dto.mode?.toLowerCase() || "auto") as AgentMode,
        systemPrompt: dto.systemPrompt,
        modelConfig: (dto.modelConfig as Prisma.InputJsonValue) || {},
        enabledTools: dto.enabledTools || [],
        maxSteps: dto.maxSteps || 25,
      },
    });

    return {
      agentId: row.agentId,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description,
      mode: row.mode.toLowerCase(),
      systemPrompt: row.systemPrompt,
      modelConfig: row.modelConfig,
      enabledTools: Array.isArray(row.enabledTools) ? (row.enabledTools as string[]) : [],
      maxSteps: row.maxSteps,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Retrieves an agent by its unique identifier, failing fast if not found.
   */
  public async getAgentById(agentId: string, tenantId: string): Promise<AgentRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const row = await this.db.agent.findFirst({
      where: { agentId, tenantId: resolvedTenantId, deletedAt: null },
    });

    if (!row) {
      throw new Error(`Agent with ID "${agentId}" not found. Please create an agent in Studio.`);
    }

    return {
      agentId: row.agentId,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description,
      mode: row.mode.toLowerCase(),
      systemPrompt: row.systemPrompt,
      modelConfig: row.modelConfig,
      enabledTools: Array.isArray(row.enabledTools) ? (row.enabledTools as string[]) : [],
      maxSteps: row.maxSteps,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing agent record.
   */
  public async updateAgent(
    agentId: string,
    dto: UpdateAgentDto,
    tenantId: string,
  ): Promise<AgentRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    const row = await this.db.agent.update({
      where: { agentId, tenantId: resolvedTenantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.mode && { mode: dto.mode.toLowerCase() as AgentMode }),
        ...(dto.systemPrompt && { systemPrompt: dto.systemPrompt }),
        ...(dto.enabledTools && { enabledTools: dto.enabledTools }),
        ...(dto.maxSteps !== undefined && { maxSteps: dto.maxSteps }),
        ...(dto.modelConfig && { modelConfig: dto.modelConfig as Prisma.InputJsonValue }),
      },
    });

    return {
      agentId: row.agentId,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description,
      mode: row.mode.toLowerCase(),
      systemPrompt: row.systemPrompt,
      modelConfig: row.modelConfig,
      enabledTools: Array.isArray(row.enabledTools) ? (row.enabledTools as string[]) : [],
      maxSteps: row.maxSteps,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Soft-deletes an agent record.
   */
  public async deleteAgent(agentId: string, tenantId: string): Promise<boolean> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    await this.db.agent.updateMany({
      where: { agentId, tenantId: resolvedTenantId },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
