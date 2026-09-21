/**
 * @file packages/memory/src/lifecycle/relevance-filter.ts
 * @description Gates memory ingestion to prevent trivial, low-entropy noise from polluting stores.
 */

const TRIVIAL_PHRASES = new Set([
  "ok",
  "okay",
  "yes",
  "no",
  "sure",
  "thanks",
  "thank you",
  "got it",
  "cool",
  "great",
  "hello",
  "hi",
  "hey",
  "bye",
  "goodbye",
]);

/**
 * Filter determining whether a text payload carries sufficient informational value to persist.
 */
export class RelevanceFilter {
  private readonly minCharLength: number;

  constructor(minCharLength = 10) {
    this.minCharLength = minCharLength;
  }

  /**
   * Assesses whether the candidate text should be recorded in persistent memory.
   *
   * @param text - Candidate text content.
   * @returns True if content is substantive and worth remembering.
   */
  public isRelevant(text: string): boolean {
    const trimmed = text.trim();

    // 1. Length guard
    if (trimmed.length < this.minCharLength) {
      return false;
    }

    // 2. Exact match against trivial pleasantries
    const normalized = trimmed.toLowerCase().replace(/[^a-z\s]/g, "");
    if (TRIVIAL_PHRASES.has(normalized)) {
      return false;
    }

    // 3. Low-entropy heuristic (e.g. repeated single characters "aaaaaa")
    const uniqueChars = new Set(normalized.replace(/\s/g, ""));
    if (uniqueChars.size <= 2 && trimmed.length > 20) {
      return false;
    }

    return true;
  }
}
