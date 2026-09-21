/**
 * @file packages/observability/src/metrics/metric-registry.ts
 * @description Central registry maintaining metric instances and aggregation state.
 */

import { Counter, Gauge, Histogram } from "./metric-instruments";
import type { ICounter, IGauge, IHistogram } from "./metric.types";

/**
 * Registry storing all registered counters, gauges, and histograms.
 */
export class MetricRegistry {
  private readonly counters = new Map<string, Counter>();
  private readonly gauges = new Map<string, Gauge>();
  private readonly histograms = new Map<string, Histogram>();

  public counter(name: string, help: string): ICounter {
    let c = this.counters.get(name);
    if (!c) {
      c = new Counter(name, help);
      this.counters.set(name, c);
    }
    return c;
  }

  public gauge(name: string, help: string): IGauge {
    let g = this.gauges.get(name);
    if (!g) {
      g = new Gauge(name, help);
      this.gauges.set(name, g);
    }
    return g;
  }

  public histogram(name: string, help: string, buckets?: number[]): IHistogram {
    let h = this.histograms.get(name);
    if (!h) {
      h = new Histogram(name, help, buckets);
      this.histograms.set(name, h);
    }
    return h;
  }

  public getCounters(): ReadonlyMap<string, Counter> {
    return this.counters;
  }

  public getGauges(): ReadonlyMap<string, Gauge> {
    return this.gauges;
  }

  public getHistograms(): ReadonlyMap<string, Histogram> {
    return this.histograms;
  }

  public clear(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}
