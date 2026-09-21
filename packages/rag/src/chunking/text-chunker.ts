/**
 * @file packages/rag/src/chunking/text-chunker.ts
 * @description Boundary-aware sliding-window text chunker with configurable token overlap.
 */

import type { ITextChunker, ChunkOptions, TextChunkResult } from "./chunker.interface";
import { estimateTokenCount } from "./token-estimator";

const DEFAULT_MAX_TOKENS = 512;
const DEFAULT_OVERLAP_TOKENS = 64;

/**
 * Text chunker implementation with boundary awareness (sentence/paragraph) and sliding overlap.
 */
export class TextChunker implements ITextChunker {
  /**
   * Splits text into overlapping, token-bounded chunks.
   */
  chunk(text: string, options: ChunkOptions = {}): TextChunkResult[] {
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }

    const maxTokens = Math.max(16, options.maxTokens ?? DEFAULT_MAX_TOKENS);
    // Overlap cannot exceed half of maxTokens to prevent infinite loops or excessive duplication
    const overlapTokens = Math.min(
      Math.floor(maxTokens / 2),
      Math.max(0, options.overlapTokens ?? DEFAULT_OVERLAP_TOKENS),
    );
    const strategy = options.strategy ?? "sentence";

    // Deconstruct text into atomic units based on strategy
    const units = this.segmentText(trimmed, strategy);
    return this.assembleChunks(trimmed, units, maxTokens, overlapTokens);
  }

  /**
   * Segments text into boundary-respecting atomic units (sentences or paragraphs).
   */
  private segmentText(text: string, strategy: string): string[] {
    if (strategy === "paragraph") {
      // Split on double newlines for paragraph boundaries
      return text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }

    if (strategy === "sentence") {
      // Regex matches sentence terminal punctuation followed by space or newline
      const matches = text.match(/[^.!?\n]+(?:[.!?]+|\n+|$)/g);
      if (matches && matches.length > 0) {
        return matches.map((s) => s.trim()).filter((s) => s.length > 0);
      }
    }

    // Default "fixed" strategy: split by whitespace into words
    return text.split(/\s+/).filter((w) => w.length > 0);
  }

  /**
   * Assembles atomic units into chunks with token budget and overlap.
   */
  private assembleChunks(
    originalText: string,
    units: string[],
    maxTokens: number,
    overlapTokens: number,
  ): TextChunkResult[] {
    const chunks: TextChunkResult[] = [];
    let currentUnits: string[] = [];
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const unit of units) {
      if (!unit) {
        continue;
      }
      const unitTokens = estimateTokenCount(unit);

      // Check if adding this unit exceeds token threshold
      if (currentTokens + unitTokens > maxTokens && currentUnits.length > 0) {
        const chunkContent = currentUnits.join(" ");
        const firstUnit = currentUnits[0] ?? "";
        const startOffset = originalText.indexOf(firstUnit);
        const endOffset = startOffset + chunkContent.length;

        chunks.push({
          chunkIndex: chunkIndex++,
          content: chunkContent,
          tokenCount: currentTokens,
          startOffset: Math.max(0, startOffset),
          endOffset: Math.max(0, endOffset),
        });

        // Compute overlap window from previous units
        const overlapUnits: string[] = [];
        let accumulatedOverlap = 0;

        for (let j = currentUnits.length - 1; j >= 0; j--) {
          const revUnit = currentUnits[j];
          if (!revUnit) {
            continue;
          }
          const revTokens = estimateTokenCount(revUnit);
          if (accumulatedOverlap + revTokens <= overlapTokens) {
            overlapUnits.unshift(revUnit);
            accumulatedOverlap += revTokens;
          } else {
            break;
          }
        }

        currentUnits = [...overlapUnits, unit];
        currentTokens = accumulatedOverlap + unitTokens;
      } else {
        currentUnits.push(unit);
        currentTokens += unitTokens;
      }
    }

    // Flush any remaining accumulated units as final chunk
    if (currentUnits.length > 0) {
      const finalContent = currentUnits.join(" ");
      const firstUnit = currentUnits[0] ?? "";
      const startOffset = originalText.indexOf(firstUnit);
      const endOffset = startOffset + finalContent.length;

      chunks.push({
        chunkIndex,
        content: finalContent,
        tokenCount: currentTokens,
        startOffset: Math.max(0, startOffset),
        endOffset: Math.max(0, endOffset),
      });
    }

    return chunks;
  }
}
