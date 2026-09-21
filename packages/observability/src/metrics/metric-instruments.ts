/**
 * @file packages/observability/src/metrics/metric-instruments.ts
 * @description In-memory metric instruments: Counter, Gauge, and Histogram.
 */

import type {
  HistogramSample,
  ICounter,
  IGauge,
  IHistogram,
  MetricLabels,
  MetricSample,
} from "./metric.types";

function serializeLabels(labels: MetricLabels): string {
  const keys = Object.keys(labels).sort();
  return keys.map((k) => `${k}="${labels[k]}"`).join(",");
}

export class Counter implements ICounter {
  private readonly values = new Map<string, { value: number; labels: MetricLabels }>();

  constructor(
    public readonly name: string,
    public readonly help: string,
  ) {}

  public inc(value: number = 1, labels: MetricLabels = {}): void {
    const key = serializeLabels(labels);
    const existing = this.values.get(key) || { value: 0, labels };
    existing.value += Math.max(0, value);
    this.values.set(key, existing);
  }

  public reset(): void {
    this.values.clear();
  }

  public getSamples(): MetricSample[] {
    return Array.from(this.values.values());
  }
}

export class Gauge implements IGauge {
  private readonly values = new Map<string, { value: number; labels: MetricLabels }>();

  constructor(
    public readonly name: string,
    public readonly help: string,
  ) {}

  public set(value: number, labels: MetricLabels = {}): void {
    const key = serializeLabels(labels);
    this.values.set(key, { value, labels });
  }

  public inc(value: number = 1, labels: MetricLabels = {}): void {
    const key = serializeLabels(labels);
    const existing = this.values.get(key) || { value: 0, labels };
    existing.value += value;
    this.values.set(key, existing);
  }

  public dec(value: number = 1, labels: MetricLabels = {}): void {
    this.inc(-value, labels);
  }

  public getSamples(): MetricSample[] {
    return Array.from(this.values.values());
  }
}

export class Histogram implements IHistogram {
  public readonly buckets: number[];
  private readonly series = new Map<
    string,
    { labels: MetricLabels; count: number; sum: number; bucketCounts: Map<number, number> }
  >();

  constructor(
    public readonly name: string,
    public readonly help: string,
    buckets: number[] = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  ) {
    this.buckets = [...buckets].sort((a, b) => a - b);
  }

  public observe(value: number, labels: MetricLabels = {}): void {
    const key = serializeLabels(labels);
    let s = this.series.get(key);
    if (!s) {
      s = {
        labels,
        count: 0,
        sum: 0,
        bucketCounts: new Map(this.buckets.map((b) => [b, 0])),
      };
      this.series.set(key, s);
    }

    s.count++;
    s.sum += value;

    for (const b of this.buckets) {
      if (value <= b) {
        s.bucketCounts.set(b, (s.bucketCounts.get(b) || 0) + 1);
      }
    }
  }

  public getSamples(): HistogramSample[] {
    return Array.from(this.series.values());
  }
}
