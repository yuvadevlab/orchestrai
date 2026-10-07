/**
 * @file packages/database/src/seeds/seed-providers-models.ts
 * @description Idempotent seeder for LLM providers and models.
 * Preserves existing database data with zero deletion or truncation.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient, Prisma } from "@prisma/client";
import { PlatformScope } from "@orchestrai/shared-types";

export const SEED_PROVIDERS = [
  {
    providerId: "1cfd2331-4eb1-45a1-9da4-dcd429060171",
    name: "Ollama",
    slug: "ollama",
    providerType: "ollama",
    description: "Local and cloud-accelerated Ollama inference engine",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    config: {},
    isEnabled: true,
    scope: PlatformScope.PLATFORM,
    sortOrder: 0,
  },
];

const SEED_MODEL_IDENTIFIER =
  process.env.DEFAULT_MODEL_NAME || process.env.OLLAMA_DEFAULT_MODEL || "default-model";

export const SEED_MODELS = [
  {
    modelId: "5f1a0c57-405e-4bf4-abb4-8d7ddc0671b9",
    providerId: "1cfd2331-4eb1-45a1-9da4-dcd429060171",
    name: SEED_MODEL_IDENTIFIER,
    modelIdentifier: SEED_MODEL_IDENTIFIER,
    description: "Configured system model from platform environment",
    capabilities: { streaming: true, toolCalls: true },
    defaultConfig: { promptPer1kUsd: 0, completionPer1kUsd: 0 },
    contextWindow: 131072,
    isDefault: true,
    isEnabled: true,
    scope: PlatformScope.PLATFORM,
    sortOrder: 0,
  },
];

/**
 * Seeds default LLM providers and models if not already present.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedProvidersAndModels(prisma: PrismaClient): Promise<void> {
  // 1. Seed Providers
  for (const prov of SEED_PROVIDERS) {
    await prisma.llmProvider.upsert({
      where: { providerId: prov.providerId },
      update: {}, // Preserve existing data
      create: {
        providerId: prov.providerId,
        name: prov.name,
        slug: prov.slug,
        providerType: prov.providerType,
        description: prov.description,
        baseUrl: prov.baseUrl,
        config: prov.config as Prisma.InputJsonValue,
        isEnabled: prov.isEnabled,
        scope: prov.scope,
        sortOrder: prov.sortOrder,
      },
    });
  }

  // 2. Seed Models
  for (const mod of SEED_MODELS) {
    await prisma.llmModel.upsert({
      where: { modelId: mod.modelId },
      update: {}, // Preserve existing data
      create: {
        modelId: mod.modelId,
        providerId: mod.providerId,
        name: mod.name,
        modelIdentifier: mod.modelIdentifier,
        description: mod.description,
        capabilities: mod.capabilities as Prisma.InputJsonValue,
        defaultConfig: mod.defaultConfig as Prisma.InputJsonValue,
        contextWindow: mod.contextWindow,
        isDefault: mod.isDefault,
        isEnabled: mod.isEnabled,
        scope: mod.scope,
        sortOrder: mod.sortOrder,
      },
    });
  }
}
