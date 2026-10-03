/**
 * @file apps/gateway/src/modules/platform/services/platform-config.service.ts
 * @description Dynamic database-backed configuration service with in-memory cache.
 * Eliminates hardcoded constants across gateway execution, cache, and suggestions.
 * @module apps/gateway/modules/platform/services
 */

import { getPrismaClient, type PrismaClient, type Prisma } from "@orchestrai/database";
import { ConfigNamespace, ConfigKey } from "@orchestrai/shared-types";

/** Cache parameters shape */
export interface SemanticCacheConfig {
  similarityThreshold: number;
  ttlMs: number;
  maxEntries: number;
}

/** Context compaction parameters shape */
export interface CompactionConfig {
  thresholdRatio: number;
  minTriggerTokens: number;
}

/** Execution limits and hyperparameters shape */
export interface ExecutionConfig {
  defaultTemperature: number;
  deterministicTemperature: number;
  factualTemperature: number;
  defaultMaxSteps: number;
  defaultMaxOutputTokens: number;
  defaultContextWindow: number;
  defaultTimeoutMs: number;
  defaultRateLimitWindowMs: number;
  defaultRateLimitMaxRequests: number;
}

/** RAG text chunking parameters shape */
export interface RagChunkingConfig {
  maxTokens: number;
  overlapTokens: number;
}

/**
 * Service managing dynamic platform configurations.
 * Reads from in-memory cache with PostgreSQL database persistence.
 */
export class PlatformConfigService {
  private cache: Map<string, unknown> = new Map();
  private lastFetchedAt: number = 0;
  private readonly CACHE_TTL_MS = 15_000; // 15 seconds in-memory cache

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Retrieves a typed configuration value from database or in-memory cache.
   *
   * @param namespace - Configuration domain (e.g. ConfigNamespace.CACHE)
   * @param key - Specific configuration key (e.g. ConfigKey.SEMANTIC_CACHE)
   * @param fallback - Fallback if not configured in database
   */
  public async getConfig<T>(
    namespace: ConfigNamespace | string,
    key: ConfigKey | string,
    fallback: T,
  ): Promise<T> {
    const cacheKey = `${namespace}:${key}`;
    const now = Date.now();

    if (this.cache.has(cacheKey) && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
      return this.cache.get(cacheKey) as T;
    }

    try {
      const record = await this.db.platformConfig.findUnique({
        where: { namespace_key: { namespace, key } },
      });

      if (record && record.value !== null && record.value !== undefined) {
        this.cache.set(cacheKey, record.value);
        this.lastFetchedAt = now;
        return record.value as T;
      }
    } catch {
      // Database read fallback
    }

    return fallback;
  }

  /**
   * Updates or registers a platform configuration in the database.
   */
  public async setConfig(
    namespace: ConfigNamespace | string,
    key: ConfigKey | string,
    value: unknown,
    description?: string,
  ): Promise<void> {
    const cacheKey = `${namespace}:${key}`;
    this.cache.set(cacheKey, value);
    this.lastFetchedAt = Date.now();

    await this.db.platformConfig.upsert({
      where: { namespace_key: { namespace, key } },
      update: {
        value: value as Prisma.InputJsonValue,
        ...(description && { description }),
      },
      create: {
        namespace,
        key,
        value: value as Prisma.InputJsonValue,
        description: description ?? `Configuration for ${namespace}:${key}`,
      },
    });
  }

  /**
   * Retrieves dynamic welcome prompt suggestion chips.
   */
  public async getWelcomeSuggestions(): Promise<string[]> {
    return this.getConfig<string[]>(ConfigNamespace.SUGGESTIONS, ConfigKey.WELCOME_CHIPS, [
      "Analyze market competitors",
      "Draft product requirements",
      "Automate data pipeline",
      "Review this codebase",
      "Build a 90-day roadmap",
    ]);
  }

  /**
   * Retrieves dynamic semantic cache parameters.
   */
  public async getSemanticCacheConfig(): Promise<SemanticCacheConfig> {
    return this.getConfig<SemanticCacheConfig>(ConfigNamespace.CACHE, ConfigKey.SEMANTIC_CACHE, {
      similarityThreshold: 0.97,
      ttlMs: 3600000,
      maxEntries: 1000,
    });
  }

  /**
   * Retrieves dynamic context compaction parameters.
   */
  public async getCompactionConfig(): Promise<CompactionConfig> {
    return this.getConfig<CompactionConfig>(
      ConfigNamespace.COMPACTION,
      ConfigKey.COMPACTION_THRESHOLD,
      {
        thresholdRatio: 0.75,
        minTriggerTokens: 4096,
      },
    );
  }

  /**
   * Retrieves dynamic execution hyperparameters and bounds.
   */
  public async getExecutionConfig(): Promise<ExecutionConfig> {
    return this.getConfig<ExecutionConfig>(
      ConfigNamespace.EXECUTION,
      ConfigKey.EXECUTION_DEFAULTS,
      {
        defaultTemperature: 0.7,
        deterministicTemperature: 0.1,
        factualTemperature: 0.2,
        defaultMaxSteps: 20,
        defaultMaxOutputTokens: 2048,
        defaultContextWindow: 8192,
        defaultTimeoutMs: 30000,
        defaultRateLimitWindowMs: 60000,
        defaultRateLimitMaxRequests: 120,
      },
    );
  }

  /**
   * Retrieves dynamic RAG chunking parameters.
   */
  public async getRagConfig(): Promise<RagChunkingConfig> {
    return this.getConfig<RagChunkingConfig>(ConfigNamespace.RAG, ConfigKey.RAG_CHUNKING, {
      maxTokens: 512,
      overlapTokens: 64,
    });
  }

  /**
   * Retrieves dynamic welcome screen headline and subtitle.
   */
  public async getWelcomeMetadata(): Promise<{ headline: string; subtitle: string }> {
    const headline = await this.getConfig<string>(
      ConfigNamespace.SUGGESTIONS,
      ConfigKey.WELCOME_HEADLINE,
      "What should your agents take on?",
    );
    const subtitle = await this.getConfig<string>(
      ConfigNamespace.SUGGESTIONS,
      ConfigKey.WELCOME_SUBTITLE,
      "One objective. A swarm of specialists. Auditable results.",
    );
    return { headline, subtitle };
  }

  /**
   * Retrieves dynamic application branding (name and version).
   */
  public async getBrandingConfig(): Promise<{ brandName: string; brandVersion: string }> {
    const brandName = await this.getConfig<string>(
      ConfigNamespace.BRANDING,
      ConfigKey.BRAND_NAME,
      process.env.APP_NAME || "OrchestrAI",
    );
    const brandVersion = await this.getConfig<string>(
      ConfigNamespace.BRANDING,
      ConfigKey.BRAND_VERSION,
      "v1.0.0 • enterprise",
    );
    return { brandName, brandVersion };
  }

  /**
   * Retrieves dynamic tool category descriptive blurbs.
   */
  public async getToolCategoryBlurbs(): Promise<Record<string, string>> {
    return this.getConfig<Record<string, string>>(
      ConfigNamespace.TOOLS,
      ConfigKey.CATEGORY_BLURBS,
      {
        "Web & Search": "Reach the live internet with grounded, cited retrieval.",
        "Documents & Data": "Author artifacts and interrogate structured data.",
        "Computation & APIs": "Execute code and talk to external systems safely.",
        Filesystem: "Inspect and mutate workspace documents and repositories safely.",
      },
    );
  }
}

export const platformConfigService = new PlatformConfigService();
