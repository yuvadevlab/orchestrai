/**
 * @file packages/rag/src/storage/vector-math.ts
 * @description Pure math functions for vector cosine similarity and dot product calculations.
 */

/**
 * Calculates the cosine similarity between two numeric vectors.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity score between -1.0 and 1.0 (or 0 if dimensions mismatch/zero length)
 */
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) {
    return 0;
  }

  const similarity = dotProduct / magnitude;
  // Guard against slight floating point overshoots beyond [-1, 1]
  return Math.max(-1, Math.min(1, similarity));
}
