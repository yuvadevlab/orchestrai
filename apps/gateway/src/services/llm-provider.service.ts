/**
 * @file apps/gateway/src/services/llm-provider.service.ts
 * @description Domain service for managing platform-wide LLM provider registry.
 * Handles CRUD for the llm_providers table. First-boot seeds defaults when empty.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import type { LlmProvider, Prisma } from "@orchestrai/database";

/** Shape returned for a provider enriched with its registered model count. */
export interface ProviderWithCount extends LlmProvider {
  modelCount: number;
}

/** DTO for creating or updating an LLM provider. */
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
 * LlmProviderService manages the global LLM provider registry.
 * All mutations are admin-gated at the controller layer.
 */
export class LlmProviderService {
  private get db(): PrismaClient {
    /* Deferred client init — avoids requiring DATABASE_URL at module load time */
    return getPrismaClient();
  }

  /**
   * Returns all registered providers ordered by sort_order then name.
   */
  public async listProviders(): Promise<ProviderWithCount[]> {
    const providers = await this.db.llmProvider.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { models: true } } },
    });
    /* Flatten Prisma _count into a plain modelCount field */
    return providers.map((p: LlmProvider & { _count: { models: number } }) => ({
      ...p,
      modelCount: p._count.models,
    }));
  }

  /**
   * Creates a new LLM provider entry.
   *
   * @param dto - Provider creation payload
   * @returns The newly created provider record
   */
  public async createProvider(dto: UpsertProviderDto): Promise<LlmProvider> {
    return this.db.llmProvider.create({
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
  }

  /**
   * Updates an existing provider by its UUID.
   *
   * @param providerId - UUID of the provider to update
   * @param dto - Partial update payload
   * @returns Updated provider record
   */
  public async updateProvider(
    providerId: string,
    dto: Partial<UpsertProviderDto>,
  ): Promise<LlmProvider> {
    return this.db.llmProvider.update({
      where: { providerId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.baseUrl !== undefined && { baseUrl: dto.baseUrl }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.config !== undefined && {
          config: dto.config as Prisma.InputJsonValue,
        }),
      },
    });
  }

  /**
   * Deletes a provider by UUID; cascades to all its associated models.
   *
   * @param providerId - UUID of the provider to delete
   */
  public async deleteProvider(providerId: string): Promise<void> {
    await this.db.llmProvider.delete({ where: { providerId } });
  }
}
