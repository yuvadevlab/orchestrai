/**
 * @file packages/model-router/src/latency-tracker.ts
 * @description Rolling window latency observer calculating P95, P99, and average percentiles.
 * @module @orchestrai/model-router
 */

/**
 * Observed latency statistical percentiles.
 */
export interface LatencyStats {
  readonly count: number;
  readonly avgMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
}

/**
 * Ring buffer latency observer maintaining empirical inference measurements.
 */
export class LatencyTracker {
  private readonly samples = new Map<string, number[]>();
  private readonly maxSamples: number;

  constructor(maxSamples = 100) {
    this.maxSamples = Math.max(10, maxSamples);
  }

  /**
   * Records a completed request latency sample in milliseconds for a candidate deployment.
   */
  public recordLatency(candidateId: string, latencyMs: number): void {
    let list = this.samples.get(candidateId);
    if (!list) {
      list = [];
      this.samples.set(candidateId, list);
    }

    list.push(latencyMs);
    // Keep window within maxSamples bound
    if (list.length > this.maxSamples) {
      list.shift();
    }
  }

  /**
   * Computes empirical P50, P95, P99, and average latency metrics for a candidate.
   */
  public getStats(candidateId: string): LatencyStats {
    const list = this.samples.get(candidateId);
    if (!list || list.length === 0) {
      return { count: 0, avgMs: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0 };
    }

    const sorted = [...list].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    const p50Index = Math.min(count - 1, Math.floor(count * 0.5));
    const p95Index = Math.min(count - 1, Math.floor(count * 0.95));
    const p99Index = Math.min(count - 1, Math.floor(count * 0.99));

    return {
      count,
      avgMs: Math.round(sum / count),
      p50Ms: sorted[p50Index] ?? 0,
      p95Ms: sorted[p95Index] ?? 0,
      p99Ms: sorted[p99Index] ?? 0,
    };
  }
}
