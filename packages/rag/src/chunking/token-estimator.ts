/**
 * @file packages/rag/src/chunking/token-estimator.ts
 * @description Fast, zero-dependency token estimation utility for text segmentation.
 */

/**
 * Average character-to-token ratio in English text (approx. 4 chars per token).
 */
const CHARS_PER_TOKEN = 4;

/**
 * Estimates the token count of a string using whitespace, punctuation, and character length.
 *
 * @param text - Plain text input
 * @returns Estimated non-negative integer token count
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  // Count words and punctuation clusters
  const words = text.trim().split(/\s+/);
  const wordBasedEstimate = Math.ceil(words.length * 1.33);

  // Cross-verify against rough character heuristic (chars / 4)
  const charBasedEstimate = Math.ceil(text.length / CHARS_PER_TOKEN);

  // Return the ceiling average of both heuristics for conservative token budget safety
  return Math.max(1, Math.ceil((wordBasedEstimate + charBasedEstimate) / 2));
}

/**
 * Estimates maximum character count corresponding to a token budget.
 *
 * @param tokens - Number of tokens
 * @returns Conservative character count limit
 */
export function estimateMaxCharacters(tokens: number): number {
  // Multiply by conservative 4 characters per token
  return Math.max(1, tokens * CHARS_PER_TOKEN);
}
