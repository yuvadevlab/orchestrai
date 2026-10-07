/**
 * @file apps/gateway/src/repositories/postgres-agent.repository.ts
 * @description PostgreSQL Prisma adapter implementing the core IAgentRepository port.
 * @module apps/gateway/repositories
 */

import { getPrismaClient, type PrismaClient, type Prisma } from "@orchestrai/database";
import type {
  IAgentRepository,
  AgentEntity,
  CreateAgentEntityData,
  ListAgentsFilter,
} from "@orchestrai/core";
import type { PaginatedResult } from "@orchestrai/shared-types";

/**
 * PostgreSQL Prisma adapter implementing IAgentRepository.
 */
export class PostgresAgentRepository implements IAgentRepository {
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  /**
   * Retrieves an agent by its ID.
   */
  public async findById(id: string, tenantId?: string): Promise<AgentEntity | null> {
    const record = await this.prisma.agent.findFirst({
      where: {
        agentId: id,
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  /**
   * Retrieves an agent by its unique URL slug.
   */
  public async findBySlug(slug: string, tenantId?: string): Promise<AgentEntity | null> {
    const records = await this.prisma.agent.findMany({
      where: {
        deletedAt: null,
        ...(tenantId ? { tenantId } : {}),
      },
    });

    const match = records.find((r) => {
      const meta = (r.metadata as Record<string, unknown>) || {};
      const recordSlug = (meta.slug as string) || r.name.toLowerCase().replace(/\s+/g, "-");
      return recordSlug === slug;
    });

    if (!match) return null;
    return this.mapToEntity(match);
  }

  /**
   * Queries paginated agents.
   */
  public async list(filter: ListAgentsFilter): Promise<PaginatedResult<AgentEntity>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(filter.tenantId ? { tenantId: filter.tenantId } : {}),
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: "insensitive" as const } },
              { description: { contains: filter.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      this.prisma.agent.count({ where }),
    ]);

    return {
      items: records.map((r) => this.mapToEntity(r)),
      total,
      page,
      limit,
      hasMore: skip + records.length < total,
    };
  }

  /**
   * Persists a new agent definition.
   */
  public async create(data: CreateAgentEntityData): Promise<AgentEntity> {
    const metadata: Record<string, unknown> = {
      slug: data.slug,
      capabilities: data.capabilities ? [...data.capabilities] : [],
      ...(data.metadata || {}),
    };

    const record = await this.prisma.agent.create({
      data: {
        ...(data.id ? { agentId: data.id } : {}),
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        tenantId: data.tenantId || null,
        modelConfig: data.defaultModel ? { model: data.defaultModel } : {},
        enabledTools: data.toolBindings ? [...data.toolBindings] : [],
        mode: (data.defaultMode as never) || "auto",
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    return this.mapToEntity(record);
  }

  /**
   * Updates an existing agent.
   */
  public async update(id: string, patch: Partial<CreateAgentEntityData>): Promise<AgentEntity> {
    const existing = await this.findById(id);
    const existingMeta = (existing?.metadata || {}) as Record<string, unknown>;

    const metadata: Record<string, unknown> = {
      ...existingMeta,
      ...(patch.slug ? { slug: patch.slug } : {}),
      ...(patch.capabilities ? { capabilities: [...patch.capabilities] } : {}),
      ...(patch.metadata || {}),
    };

    const record = await this.prisma.agent.update({
      where: { agentId: id },
      data: {
        ...(patch.name ? { name: patch.name } : {}),
        ...(patch.description ? { description: patch.description } : {}),
        ...(patch.systemPrompt ? { systemPrompt: patch.systemPrompt } : {}),
        ...(patch.defaultModel ? { modelConfig: { model: patch.defaultModel } } : {}),
        ...(patch.toolBindings ? { enabledTools: [...patch.toolBindings] } : {}),
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    return this.mapToEntity(record);
  }

  /**
   * Soft deletes an agent definition.
   */
  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.agent.update({
        where: { agentId: id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToEntity(record: {
    agentId: string;
    name: string;
    description: string | null;
    systemPrompt: string;
    modelConfig: unknown;
    mode: string;
    tenantId: string | null;
    enabledTools: unknown;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): AgentEntity {
    const meta = (record.metadata as Record<string, unknown>) || {};
    const modelCfg = (record.modelConfig as Record<string, unknown>) || {};
    const slug = (meta.slug as string) || record.name.toLowerCase().replace(/\s+/g, "-");

    return {
      id: record.agentId,
      name: record.name,
      slug,
      description: record.description || "",
      systemPrompt: record.systemPrompt,
      defaultModel: (modelCfg.model as string) || undefined,
      defaultMode: record.mode,
      tenantId: record.tenantId || undefined,
      capabilities: Array.isArray(meta.capabilities) ? (meta.capabilities as string[]) : [],
      toolBindings: Array.isArray(record.enabledTools) ? (record.enabledTools as string[]) : [],
      isEnabled: true,
      metadata: meta,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
