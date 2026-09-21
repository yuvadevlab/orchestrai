/**
 * @file packages/rag/src/context/context-builder.ts
 * @description Assembles retrieved knowledge chunks into prompt-ready context with citations.
 */

import type { ScoredDocumentChunk } from "../contracts/chunk.schema";
import type {
  ContextBuildOptions,
  ContextCitation,
  FormattedContext,
} from "./context-builder.types";
import { estimateTokenCount } from "../chunking/token-estimator";

const DEFAULT_MAX_TOKENS = 2048;

/**
 * Formats retrieved chunks into token-budgeted prompt context with structured citations.
 */
export class ContextBuilder {
  /**
   * Assembles ranked document chunks into a prompt-ready markdown context string.
   */
  build(chunks: ScoredDocumentChunk[], options: ContextBuildOptions = {}): FormattedContext {
    if (chunks.length === 0) {
      return {
        contextText: "",
        citations: [],
        totalTokens: 0,
        chunkCount: 0,
      };
    }

    const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    const citationStyle = options.citationStyle ?? "bracket";
    const citations: ContextCitation[] = [];
    const contextSnippets: string[] = [];
    let accumulatedTokens = 0;
    const seenChunkIds = new Set<string>();

    for (const item of chunks) {
      if (!item) {
        continue;
      }
      const chunk = item.chunk;

      // Skip duplicate chunks if retrieved multiple times
      if (seenChunkIds.has(chunk.chunkId)) {
        continue;
      }
      seenChunkIds.add(chunk.chunkId);

      const citationId = citations.length + 1;
      const title = item.documentTitle || "Unknown Document";
      const source = item.sourceUri || "unknown";

      const snippet = this.formatSnippet(
        citationId,
        title,
        source,
        chunk.chunkIndex,
        chunk.content,
        citationStyle,
      );

      const snippetTokens = estimateTokenCount(snippet);

      // Verify token budget limits before appending
      if (accumulatedTokens + snippetTokens > maxTokens && contextSnippets.length > 0) {
        break;
      }

      contextSnippets.push(snippet);
      accumulatedTokens += snippetTokens;

      citations.push({
        citationId,
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        documentTitle: title,
        sourceUri: source,
        chunkIndex: chunk.chunkIndex,
      });
    }

    const contextText = contextSnippets.join("\n\n---\n\n");

    return {
      contextText,
      citations,
      totalTokens: accumulatedTokens,
      chunkCount: citations.length,
    };
  }

  /**
   * Formats a single snippet block with header and citation reference.
   */
  private formatSnippet(
    id: number,
    title: string,
    source: string,
    chunkIndex: number,
    content: string,
    style: "bracket" | "footnote",
  ): string {
    if (style === "footnote") {
      return `> ${content}\n[^${id}]: Source: "${title}" (${source}, section ${chunkIndex})`;
    }

    return `[${id}] Source: "${title}" (${source}, chunk ${chunkIndex})\n${content}`;
  }
}
