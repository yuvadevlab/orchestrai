/**
 * @file apps/gateway/src/services/agent.service.ts
 * @description Domain service for managing agent registration, configuration, and inspection in PostgreSQL.
 * @module apps/gateway/services
 */

import {
  getPrismaClient,
  type PrismaClient,
  type AgentMode,
  type Prisma,
} from "@orchestrai/database";
import type { CreateAgentDto, UpdateAgentDto, AgentFilterDto } from "@/validation";
import { AgentMode as SharedAgentMode } from "@orchestrai/shared-types";
import { resolveDbTenantId } from "./tenant-resolver";

export interface AgentRecord {
  agentId: string;
  tenantId: string;
  name: string;
  description?: string | null;
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

const DEFAULT_SUPERVISOR = {
  name: "Supervisor Orchestrator",
  description: "Primary orchestrator decomposing user intents into parallel execution DAGs.",
  mode: "auto" as AgentMode,
  systemPrompt:
    "You are the OrchestrAI Supervisor. Analyze user requests, construct DAG execution plans, and synthesize results.",
  modelConfig: { model: "gemma4:31b-cloud" },
  enabledTools: ["code_sandbox", "brave_search"],
  maxSteps: 30,
};

/**
 * Service managing agent definition lifecycle and configuration storage in PostgreSQL.
 */
export class AgentService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  private async ensureTenantAgents(tenantId: string): Promise<void> {
    const count = await this.db.agent.count({
      where: { tenantId, deletedAt: null },
    });
    if (count === 0) {
      await this.db.agent.create({
        data: {
          tenantId,
          name: DEFAULT_SUPERVISOR.name,
          description: DEFAULT_SUPERVISOR.description,
          mode: DEFAULT_SUPERVISOR.mode,
          systemPrompt: DEFAULT_SUPERVISOR.systemPrompt,
          modelConfig: DEFAULT_SUPERVISOR.modelConfig,
          enabledTools: DEFAULT_SUPERVISOR.enabledTools,
          maxSteps: DEFAULT_SUPERVISOR.maxSteps,
        },
      });
    }
  }

  public async listAgents(filter: AgentFilterDto, tenantId: string): Promise<AgentListResult> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    await this.ensureTenantAgents(resolvedTenantId);

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

  public async getAgentById(agentId: string, tenantId: string): Promise<AgentRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const row = await this.db.agent.findFirst({
      where: { agentId, tenantId: resolvedTenantId, deletedAt: null },
    });

    if (row) {
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

    return this.createAgent(
      {
        name: DEFAULT_SUPERVISOR.name,
        description: DEFAULT_SUPERVISOR.description,
        mode: SharedAgentMode.AUTO,
        systemPrompt: DEFAULT_SUPERVISOR.systemPrompt,
        enabledTools: DEFAULT_SUPERVISOR.enabledTools,
        maxSteps: DEFAULT_SUPERVISOR.maxSteps,
      },
      resolvedTenantId,
    );
  }

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

  public async deleteAgent(agentId: string, tenantId: string): Promise<boolean> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    await this.db.agent.updateMany({
      where: { agentId, tenantId: resolvedTenantId },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
