/**
 * @file apps/admin/src/services/llm-provider.service.ts
 * @description Operator Control Plane service managing the global LLM Provider catalog.
 * @module apps/admin/services
 */

import {
  getPrismaClient,
  type PrismaClient,
  type LlmProvider,
  type Prisma,
} from "@orchestrai/database";
import type { LlmProviderRecord } from "@orchestrai/shared-types";

/**
 * Payload interface for registering or modifying an LLM provider.
 */
export interface UpsertProviderDto {
  name: string;
  slug: string;
  providerType: string;
  description?: string;
  baseUrl?: string;
  config?: Record<string, unknown>;
  isEnabled?: boolean;
  sortOrder?: number;
}

/**
 * Admin service managing LLM provider lifecycle operations.
 */
export class LlmProviderAdminService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Retrieves all registered LLM providers with associated model counts.
   */
  public async listProviders(): Promise<LlmProviderRecord[]> {
    const providers = await this.db.llmProvider.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { models: true } } },
    });

    return providers.map((p: LlmProvider & { _count: { models: number } }) => ({
      providerId: p.providerId,
      name: p.name,
      slug: p.slug,
      providerType: p.providerType,
      description: p.description ?? undefined,
      baseUrl: p.baseUrl ?? undefined,
      config: (p.config ?? {}) as Record<string, unknown>,
      isEnabled: p.isEnabled,
      sortOrder: p.sortOrder,
      modelCount: p._count.models,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  /**
   * Registers a new LLM provider in the platform catalog.
   */
  public async createProvider(dto: UpsertProviderDto): Promise<LlmProviderRecord> {
    const p = await this.db.llmProvider.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        providerType: dto.providerType,
        description: dto.description,
        baseUrl: dto.baseUrl,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      providerId: p.providerId,
      name: p.name,
      slug: p.slug,
      providerType: p.providerType,
      description: p.description ?? undefined,
      baseUrl: p.baseUrl ?? undefined,
      config: (p.config ?? {}) as Record<string, unknown>,
      isEnabled: p.isEnabled,
      sortOrder: p.sortOrder,
      modelCount: 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing LLM provider.
   */
  public async updateProvider(
    providerId: string,
    dto: Partial<UpsertProviderDto>,
  ): Promise<LlmProviderRecord> {
    const p = await this.db.llmProvider.update({
      where: { providerId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.providerType !== undefined && { providerType: dto.providerType }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.baseUrl !== undefined && { baseUrl: dto.baseUrl }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
      },
    });

    return {
      providerId: p.providerId,
      name: p.name,
      slug: p.slug,
      providerType: p.providerType,
      description: p.description ?? undefined,
      baseUrl: p.baseUrl ?? undefined,
      config: (p.config ?? {}) as Record<string, unknown>,
      isEnabled: p.isEnabled,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  /**
   * Removes an LLM provider from the catalog.
   */
  public async deleteProvider(providerId: string): Promise<void> {
    await this.db.llmProvider.delete({ where: { providerId } });
  }
}
