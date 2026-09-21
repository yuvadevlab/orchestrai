/**
 * @file packages/rag/src/storage/memory-matchers.ts
 * @description In-memory filtering and lexical keyword matching utilities.
 */

import type { Document, RagFilter } from "../contracts";

/**
 * Checks if a document satisfies the provided tenancy and metadata filter.
 *
 * @param doc - Document to test
 * @param filter - Tenancy and metadata filter
 * @returns True if document matches filter or if filter is omitted
 */
export function matchesRagFilter(doc: Document, filter?: RagFilter): boolean {
  if (!filter) {
    return true;
  }
  if (filter.tenantId && doc.tenantId !== filter.tenantId) {
    return false;
  }
  if (filter.documentIds && !filter.documentIds.includes(doc.documentId)) {
    return false;
  }
  if (filter.mimeType && doc.mimeType !== filter.mimeType) {
    return false;
  }
  return true;
}

/**
 * Calculates a simple keyword density match score for a text string against query terms.
 *
 * @param content - Document chunk text content
 * @param terms - Query terms
 * @returns Score between 0.0 and 1.0
 */
export function scoreKeywordMatch(content: string, terms: string[]): number {
  if (terms.length === 0) {
    return 0;
  }
  const contentLower = content.toLowerCase();
  let matches = 0;
  for (const term of terms) {
    if (contentLower.includes(term)) {
      matches++;
    }
  }
  return matches / terms.length;
}
