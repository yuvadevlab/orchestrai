/**
 * @file packages/rag/src/embeddings/ollama-embedding-provider.ts
 * @description HTTP client for Ollama embedding models (e.g. nomic-embed-text, all-minilm).
 */

import { RagError } from "@orchestrai/core";
import type { IEmbeddingProvider } from "./embedding-provider.interface";

/**
 * Configuration options for Ollama embedding provider.
 */
export interface OllamaEmbeddingConfig {
  /** Ollama HTTP base URL (defaults to http://localhost:11434) */
  baseUrl?: string;
  /** Embedding model name (defaults to nomic-embed-text) */
  model?: string;
  /** Expected vector dimension (defaults to 1536) */
  dimension?: number;
  /** Network timeout in milliseconds (defaults to 30000ms) */
  timeoutMs?: number;
}

/**
 * Ollama embedding provider connecting to local or remote Ollama instances.
 */
export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  readonly dimension: number;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config: OllamaEmbeddingConfig = {}) {
    this.baseUrl = (config.baseUrl ?? "http://localhost:11434").replace(/\/+$/, "");
    this.model = config.model ?? "nomic-embed-text";
    this.dimension = config.dimension ?? 1536;
    this.timeoutMs = config.timeoutMs ?? 30000;
  }

  /**
   * Embeds a single text prompt using Ollama /api/embeddings or /api/embed.
   */
  async embedText(text: string): Promise<number[]> {
    const batch = await this.embedBatch([text]);
    if (batch.length === 0 || !batch[0]) {
      throw new RagError("Ollama returned empty embedding vector for input text", {
        model: this.model,
      });
    }
    return batch[0];
  }

  /**
   * Embeds a batch of texts using Ollama's HTTP API.
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // Try modern Ollama /api/embed endpoint first
      const response = await fetch(`${this.baseUrl}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.model, input: texts }),
        signal: controller.signal,
      });

      if (response.ok) {
        const body = (await response.json()) as { embeddings?: number[][] };
        if (Array.isArray(body.embeddings)) {
          return body.embeddings;
        }
      }

      // Fallback to sequential /api/embeddings for older Ollama versions
      return await this.embedSequentialLegacy(texts, controller.signal);
    } catch (err: unknown) {
      if (err instanceof RagError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new RagError(`Failed to generate Ollama embeddings: ${message}`, {
        baseUrl: this.baseUrl,
        model: this.model,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Legacy single-call sequential fallback for older Ollama daemon instances.
   */
  private async embedSequentialLegacy(texts: string[], signal: AbortSignal): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      const resp = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.model, prompt: text }),
        signal,
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => resp.statusText);
        throw new RagError(`Ollama /api/embeddings returned HTTP ${resp.status}: ${errText}`);
      }

      const data = (await resp.json()) as { embedding?: number[] };
      if (!Array.isArray(data.embedding)) {
        throw new RagError("Ollama payload missing 'embedding' array");
      }
      results.push(data.embedding);
    }
    return results;
  }
}
