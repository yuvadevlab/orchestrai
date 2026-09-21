/**
 * @file packages/memory/src/storage/vector-math.ts
 * @description Pure math functions for vector operations and cosine similarity calculation.
 */

/**
 * Calculates cosine similarity between two numeric vectors.
 * Returns a normalized score between 0.0 and 1.0.
 *
 * @param a - First vector array.
 * @param b - Second vector array.
 * @returns Cosine similarity score (0.0 = orthogonal/opposite, 1.0 = identical).
 */
export function calculateCosineSimilarity(a: readonly number[], b: readonly number[]): number {
  // Guard: Vectors must have matching non-zero lengths
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
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

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  // Guard: Avoid divide-by-zero on zero-magnitude vectors
  if (denominator === 0) {
    return 0;
  }

  const rawCosine = dotProduct / denominator;
  // Normalize from [-1, 1] to [0, 1] for clean threshold comparisons
  return Math.max(0, Math.min(1, (rawCosine + 1) / 2));
}
