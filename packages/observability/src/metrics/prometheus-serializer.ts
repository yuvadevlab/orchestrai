/**
 * @file packages/observability/src/metrics/prometheus-serializer.ts
 * @description Serializer formatting in-memory metrics into Prometheus text exposition format.
 */

import type { MetricRegistry } from "./metric-registry";
import type { MetricLabels } from "./metric.types";

function formatLabels(labels: MetricLabels, extra?: Record<string, string>): string {
  const merged = { ...labels, ...extra };
  const keys = Object.keys(merged).sort();
  if (keys.length === 0) return "";
  const parts = keys.map((k) => `${k}="${String(merged[k]).replace(/"/g, '\\"')}"`);
  return `{${parts.join(",")}}`;
}

/**
 * Serializes all metrics in the registry into Prometheus text exposition format.
 *
 * @param registry - Active MetricRegistry containing metric series
 * @returns UTF-8 text string formatted for /metrics HTTP scrape endpoints
 */
export function serializeToPrometheusText(registry: MetricRegistry): string {
  const lines: string[] = [];

  // 1. Serialize Counters
  for (const counter of registry.getCounters().values()) {
    lines.push(`# HELP ${counter.name} ${counter.help}`);
    lines.push(`# TYPE ${counter.name} counter`);
    for (const sample of counter.getSamples()) {
      lines.push(`${counter.name}${formatLabels(sample.labels)} ${sample.value}`);
    }
  }

  // 2. Serialize Gauges
  for (const gauge of registry.getGauges().values()) {
    lines.push(`# HELP ${gauge.name} ${gauge.help}`);
    lines.push(`# TYPE ${gauge.name} gauge`);
    for (const sample of gauge.getSamples()) {
      lines.push(`${gauge.name}${formatLabels(sample.labels)} ${sample.value}`);
    }
  }

  // 3. Serialize Histograms
  for (const hist of registry.getHistograms().values()) {
    lines.push(`# HELP ${hist.name} ${hist.help}`);
    lines.push(`# TYPE ${hist.name} histogram`);
    for (const sample of hist.getSamples()) {
      let cumulative = 0;
      for (const bucket of hist.buckets) {
        cumulative += sample.bucketCounts.get(bucket) || 0;
        lines.push(
          `${hist.name}_bucket${formatLabels(sample.labels, { le: String(bucket) })} ${cumulative}`,
        );
      }
      lines.push(
        `${hist.name}_bucket${formatLabels(sample.labels, { le: "+Inf" })} ${sample.count}`,
      );
      lines.push(`${hist.name}_sum${formatLabels(sample.labels)} ${sample.sum}`);
      lines.push(`${hist.name}_count${formatLabels(sample.labels)} ${sample.count}`);
    }
  }

  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}
