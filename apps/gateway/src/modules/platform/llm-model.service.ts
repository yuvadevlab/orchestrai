/**
 * @file apps/gateway/src/services/llm-model.service.ts
 * @description Domain service for managing the platform-wide LLM model catalog.
 * Handles CRUD for the llm_models table. First-boot seeds defaults when empty.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import type { LlmModel, Prisma } from "@orchestrai/database";

/** DTO for creating or updating an LLM model. */
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
 * LlmModelService manages the global AI model catalog.
 * All mutations are admin-gated at the controller layer.
 */
export class LlmModelService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Returns all models, optionally filtered by provider UUID.
   *
   * @param providerId - Optional provider UUID to filter by
   */
  public async listModels(providerId?: string): Promise<LlmModel[]> {
    return this.db.llmModel.findMany({
      where: providerId ? { providerId } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Returns the globally configured default model from the database.
   * If no model is explicitly flagged isDefault, falls back to the first active model.
   */
  public async getDefaultModel(): Promise<LlmModel | null> {
    const envModelName = process.env.DEFAULT_MODEL_NAME;
    if (envModelName) {
      const match = await this.db.llmModel.findFirst({
        where: { modelIdentifier: envModelName, isEnabled: true },
      });
      if (match) return match;
    }
    const defaultModel = await this.db.llmModel.findFirst({
      where: { isDefault: true, isEnabled: true },
    });
    if (defaultModel) {
      return defaultModel;
    }
    return this.db.llmModel.findFirst({
      where: { isEnabled: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Creates a new model under the specified provider.
   *
   * @param dto - Model creation payload
   * @returns The newly created model record
   */
  public async createModel(dto: UpsertModelDto): Promise<LlmModel> {
    return this.db.llmModel.create({
      data: {
        providerId: dto.providerId,
        name: dto.name,
        modelIdentifier: dto.modelIdentifier,
        description: dto.description,
        capabilities: (dto.capabilities ?? {}) as Prisma.InputJsonValue,
        defaultConfig: (dto.defaultConfig ?? {}) as Prisma.InputJsonValue,
        contextWindow: dto.contextWindow ?? 8192,
        isDefault: dto.isDefault ?? false,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * Updates an existing model by its UUID.
   *
   * @param modelId - UUID of the model to update
   * @param dto - Partial update payload
   * @returns Updated model record
   */
  public async updateModel(modelId: string, dto: Partial<UpsertModelDto>): Promise<LlmModel> {
    return this.db.llmModel.update({
      where: { modelId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.contextWindow !== undefined && {
          contextWindow: dto.contextWindow,
        }),
        ...(dto.defaultConfig !== undefined && {
          defaultConfig: dto.defaultConfig as Prisma.InputJsonValue,
        }),
      },
    });
  }

  /**
   * Removes a model from the catalog by its UUID.
   *
   * @param modelId - UUID of the model to delete
   */
  public async deleteModel(modelId: string): Promise<void> {
    await this.db.llmModel.delete({ where: { modelId } });
  }
}
