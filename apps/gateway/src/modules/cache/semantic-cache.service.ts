/**
 * @file apps/gateway/src/modules/cache/semantic-cache.service.ts
 * @description Enterprise semantic vector cache wiring @orchestrai/semantic-cache into the gateway.
 * Dynamically configured from database platform_configs with zero hardcoding.
 * @module apps/gateway/modules/cache
 */

import { SemanticCache, SemanticCacheStats } from "@orchestrai/semantic-cache";
import { CacheHitStatus } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { ResilientEmbeddingProvider } from "@/modules/rag/rag.service";
import { platformConfigService } from "@/modules/platform/services/platform-config.service";

const logger = loggerWithConfig(new Logger("SemanticCacheService"));

let cacheInstance: SemanticCache<string> | null = null;
let lastConfigSync = 0;
const SYNC_INTERVAL_MS = 30_000;

/**
 * Returns dynamic semantic cache instance wired with latest database configuration.
 */
async function getSemanticCache(): Promise<SemanticCache<string>> {
  const now = Date.now();
  if (cacheInstance && now - lastConfigSync < SYNC_INTERVAL_MS) {
    return cacheInstance;
  }

  const config = await platformConfigService.getSemanticCacheConfig();
  cacheInstance = new SemanticCache<string>(new ResilientEmbeddingProvider(), {
    similarityThreshold: config.similarityThreshold,
    defaultTtlMs: config.ttlMs,
    maxEntries: config.maxEntries,
  });
  lastConfigSync = now;
  return cacheInstance;
}

/**
 * Looks up a previously cached model output for a given prompt query.
 *
 * @param prompt - Inbound user prompt
 * @returns Cached response string on HIT, or null on MISS
 */
export async function checkSemanticCache(prompt: string): Promise<string | null> {
  try {
    const cache = await getSemanticCache();
    const result = await cache.get(prompt);

    if (result.status === CacheHitStatus.HIT && typeof result.value === "string") {
      logger.info("Semantic cache HIT", {
        promptPreview: prompt.slice(0, 60),
        similarityScore: result.similarityScore,
      });
      return result.value;
    }

    logger.debug("Semantic cache MISS", {
      promptPreview: prompt.slice(0, 60),
      similarityScore: result.similarityScore,
    });
    return null;
  } catch (err) {
    // Cache lookup is non-blocking — log and fallback to model generation
    logger.debug("Semantic cache lookup bypassed on error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Stores a prompt and its final generated response into the semantic cache.
 *
 * @param prompt - Original input prompt
 * @param response - Final generated output response
 */
export async function storeSemanticCache(prompt: string, response: string): Promise<void> {
  if (!prompt.trim() || !response.trim()) {
    return;
  }

  try {
    const cache = await getSemanticCache();
    await cache.set(prompt, response);
    logger.debug("Stored prompt/response in semantic cache", {
      promptPreview: prompt.slice(0, 60),
      responseLength: response.length,
    });
  } catch (err) {
    // Cache persistence failure must not fail the execution response
    logger.warn("Failed to store entry in semantic cache", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Retrieves cache utilization and hit/miss statistics.
 */
export async function getSemanticCacheStats(): Promise<SemanticCacheStats> {
  const cache = await getSemanticCache();
  return cache.getStats();
}
