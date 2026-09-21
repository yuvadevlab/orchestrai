/**
 * @file packages/observability/src/metrics/metric.types.ts
 * @description Types, interfaces, and sample structures for Prometheus-compatible telemetry metrics.
 */

export enum MetricType {
  COUNTER = "counter",
  GAUGE = "gauge",
  HISTOGRAM = "histogram",
}

export type MetricLabels = Record<string, string>;

export interface MetricSample {
  value: number;
  labels: MetricLabels;
  timestampMs?: number;
}

export interface ICounter {
  readonly name: string;
  readonly help: string;
  inc(value?: number, labels?: MetricLabels): void;
  reset(): void;
  getSamples(): MetricSample[];
}

export interface IGauge {
  readonly name: string;
  readonly help: string;
  set(value: number, labels?: MetricLabels): void;
  inc(value?: number, labels?: MetricLabels): void;
  dec(value?: number, labels?: MetricLabels): void;
  getSamples(): MetricSample[];
}

export interface HistogramSample {
  labels: MetricLabels;
  count: number;
  sum: number;
  bucketCounts: Map<number, number>;
}

export interface IHistogram {
  readonly name: string;
  readonly help: string;
  readonly buckets: number[];
  observe(value: number, labels?: MetricLabels): void;
  getSamples(): HistogramSample[];
}
