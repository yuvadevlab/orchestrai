/**
 * @file apps/gateway/src/modules/cache/semantic-cache.service.ts
 * @description Enterprise semantic vector cache wiring @orchestrai/semantic-cache into the gateway.
 * Deduplicates inbound agent prompts based on cosine similarity, saving model calls and latency.
 * @module apps/gateway/modules/cache
 */

import { SemanticCache, SemanticCacheStats } from "@orchestrai/semantic-cache";
import { CacheHitStatus } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { ResilientEmbeddingProvider } from "@/modules/rag/rag.service";

const logger = loggerWithConfig(new Logger("SemanticCacheService"));

/**
 * Singleton semantic cache instance configured with resilient vector embeddings.
 */
const semanticCache = new SemanticCache<string>(new ResilientEmbeddingProvider(), {
  similarityThreshold: 0.97,
  defaultTtlMs: 3600000,
  maxEntries: 1000,
});

/**
 * Looks up a previously cached model output for a given prompt query.
 *
 * @param prompt - Inbound user prompt
 * @returns Cached response string on HIT, or null on MISS
 */
export async function checkSemanticCache(prompt: string): Promise<string | null> {
  try {
    const result = await semanticCache.get(prompt);

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
    await semanticCache.set(prompt, response);
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
export function getSemanticCacheStats(): SemanticCacheStats {
  return semanticCache.getStats();
}
