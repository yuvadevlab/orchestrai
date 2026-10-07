/**
 * @file apps/admin/src/services/llm-model.service.ts
 * @description Operator Control Plane service managing the global LLM Model catalog.
 * @module apps/admin/services
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import {
  getPrismaClient,
  type PrismaClient,
  type LlmModel,
  type Prisma,
} from "@orchestrai/database";
import type { LlmModelRecord } from "@orchestrai/shared-types";

/**
 * Payload interface for registering or modifying an LLM model deployment.
 */
export interface UpsertModelDto {
  providerId: string;
  name: string;
  modelIdentifier: string;
  description?: string;
  capabilities?: Record<string, unknown>;
  defaultConfig?: Record<string, unknown>;
  contextWindow?: number;
  isDefault?: boolean;
  isEnabled?: boolean;
  sortOrder?: number;
}

/**
 * Admin service managing LLM model registrations.
 */
export class LlmModelAdminService {
  private readonly logger = loggerWithConfig(new Logger("LlmModelAdminService"));

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Lists models optionally filtered by provider.
   */
  public async listModels(providerId?: string): Promise<LlmModelRecord[]> {
    this.logger.info("listModels: querying LLM models", { providerId });

    // Query registered LLM models with optional providerId filtering
    const models = await this.db.llmModel.findMany({
      where: providerId ? { providerId } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { provider: true },
    });

    return models.map((m: LlmModel & { provider: unknown }) => ({
      modelId: m.modelId,
      providerId: m.providerId,
      name: m.name,
      modelIdentifier: m.modelIdentifier,
      description: m.description ?? undefined,
      capabilities: (m.capabilities ?? {}) as Record<string, unknown>,
      defaultConfig: (m.defaultConfig ?? {}) as Record<string, unknown>,
      contextWindow: m.contextWindow ?? undefined,
      isDefault: m.isDefault,
      isEnabled: m.isEnabled,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  }

  /**
   * Registers a new LLM model.
   */
  public async createModel(dto: UpsertModelDto): Promise<LlmModelRecord> {
    this.logger.info("createModel: registering new LLM model", {
      providerId: dto.providerId,
      modelIdentifier: dto.modelIdentifier,
    });

    // Create new LLM model deployment record
    const m = await this.db.llmModel.create({
      data: {
        providerId: dto.providerId,
        name: dto.name,
        modelIdentifier: dto.modelIdentifier,
        description: dto.description,
        capabilities: (dto.capabilities ?? {}) as Prisma.InputJsonValue,
        defaultConfig: (dto.defaultConfig ?? {}) as Prisma.InputJsonValue,
        contextWindow: dto.contextWindow,
        isDefault: dto.isDefault ?? false,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      modelId: m.modelId,
      providerId: m.providerId,
      name: m.name,
      modelIdentifier: m.modelIdentifier,
      description: m.description ?? undefined,
      capabilities: (m.capabilities ?? {}) as Record<string, unknown>,
      defaultConfig: (m.defaultConfig ?? {}) as Record<string, unknown>,
      contextWindow: m.contextWindow ?? undefined,
      isDefault: m.isDefault,
      isEnabled: m.isEnabled,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing LLM model.
   */
  public async updateModel(modelId: string, dto: Partial<UpsertModelDto>): Promise<LlmModelRecord> {
    this.logger.info("updateModel: updating LLM model", {
      modelId,
      modelIdentifier: dto.modelIdentifier,
    });

    // Update model record in catalog
    const m = await this.db.llmModel.update({
      where: { modelId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.modelIdentifier !== undefined && { modelIdentifier: dto.modelIdentifier }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.contextWindow !== undefined && { contextWindow: dto.contextWindow }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.capabilities !== undefined && {
          capabilities: dto.capabilities as Prisma.InputJsonValue,
        }),
        ...(dto.defaultConfig !== undefined && {
          defaultConfig: dto.defaultConfig as Prisma.InputJsonValue,
        }),
      },
    });

    return {
      modelId: m.modelId,
      providerId: m.providerId,
      name: m.name,
      modelIdentifier: m.modelIdentifier,
      description: m.description ?? undefined,
      capabilities: (m.capabilities ?? {}) as Record<string, unknown>,
      defaultConfig: (m.defaultConfig ?? {}) as Record<string, unknown>,
      contextWindow: m.contextWindow ?? undefined,
      isDefault: m.isDefault,
      isEnabled: m.isEnabled,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }

  /**
   * Removes a model deployment from the platform catalog.
   */
  public async deleteModel(modelId: string): Promise<void> {
    this.logger.info("deleteModel: removing LLM model from catalog", { modelId });
    // Cascade delete LLM model
    await this.db.llmModel.delete({ where: { modelId } });
  }
}
