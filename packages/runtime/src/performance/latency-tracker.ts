/**
 * @file latency-tracker.ts
 * @description Quantile latency estimator tracking p50, p95, and p99 metrics.
 * @module @orchestrai/runtime/performance
 */

/** Quantile summary report metrics */
export interface LatencyQuantiles {
  readonly count: number;
  readonly minMs: number;
  readonly maxMs: number;
  readonly meanMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
}

/**
 * High-performance latency sample tracker computing exact and quantile summaries.
 */
export class LatencyTracker {
  private samples: number[] = [];

  /**
   * @param maxSamples - Maximum sample window size (default: 1,000)
   */
  constructor(private readonly maxSamples: number = 1000) {}

  /**
   * Records a latency sample in milliseconds.
   *
   * @param durationMs - Execution duration in milliseconds.
   */
  public record(durationMs: number): void {
    if (durationMs < 0) return;

    if (this.samples.length >= this.maxSamples) {
      this.samples.shift();
    }
    this.samples.push(durationMs);
  }

  /**
   * Computes latency quantiles (min, max, mean, p50, p95, p99).
   */
  public getQuantiles(): LatencyQuantiles {
    if (this.samples.length === 0) {
      return { count: 0, minMs: 0, maxMs: 0, meanMs: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0 };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    const getPercentile = (p: number): number => {
      const idx = Math.min(Math.floor((p / 100) * count), count - 1);
      return sorted[idx] ?? 0;
    };

    return {
      count,
      minMs: sorted[0] ?? 0,
      maxMs: sorted[count - 1] ?? 0,
      meanMs: Math.round(sum / count),
      p50Ms: getPercentile(50),
      p95Ms: getPercentile(95),
      p99Ms: getPercentile(99),
    };
  }

  /**
   * Clears recorded latency samples.
   */
  public reset(): void {
    this.samples = [];
  }
}
