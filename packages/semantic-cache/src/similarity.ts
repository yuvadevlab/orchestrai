/**
 * @file packages/semantic-cache/src/similarity.ts
 * @description Vector cosine similarity and distance calculation math utilities.
 * @module @orchestrai/semantic-cache
 */

/**
 * Calculates cosine similarity between two float vectors.
 *
 * @param a - First vector embedding
 * @param b - Second vector embedding
 * @returns Cosine similarity score between -1.0 and 1.0 (1.0 = identical)
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || a.length === 0) {
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

  // Guard against zero-vector division
  if (normA === 0 || normB === 0) {
    return 0;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return Number((dotProduct / denominator).toFixed(6));
}
