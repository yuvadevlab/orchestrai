/**
 * @file packages/observability/src/index.ts
 * @description Master entrypoint and unified Observability facade for the OrchestrAI platform.
 */

import { Tracer, OtlpHttpSpanExporter, InMemorySpanExporter } from "./tracing";
import { MetricRegistry, registerStandardMetrics, type StandardMetrics } from "./metrics";

export * from "./context";
export * from "./tracing";
export * from "./metrics";
export * from "./logging";

export interface ObservabilityOptions {
  serviceName?: string;
  otlpEndpoint?: string;
  useMemoryExporter?: boolean;
}

let defaultTracer: Tracer | undefined;
let defaultMetricRegistry: MetricRegistry | undefined;
let defaultStandardMetrics: StandardMetrics | undefined;

/**
 * Initializes global telemetry collectors, tracer, and metrics registry.
 *
 * @param options - Telemetry configuration options
 */
export function initObservability(options: ObservabilityOptions = {}): {
  tracer: Tracer;
  registry: MetricRegistry;
  metrics: StandardMetrics;
} {
  const serviceName = options.serviceName || process.env.SERVICE_NAME || "orchestrai";
  const exporter = options.useMemoryExporter
    ? new InMemorySpanExporter()
    : new OtlpHttpSpanExporter(options.otlpEndpoint || process.env.OTEL_EXPORTER_OTLP_ENDPOINT);

  defaultTracer = new Tracer(serviceName, exporter);
  defaultMetricRegistry = new MetricRegistry();
  defaultStandardMetrics = registerStandardMetrics(defaultMetricRegistry);

  return {
    tracer: defaultTracer,
    registry: defaultMetricRegistry,
    metrics: defaultStandardMetrics,
  };
}

/**
 * Returns the active default tracer instance.
 */
export function getTracer(): Tracer {
  if (!defaultTracer) {
    initObservability({ useMemoryExporter: true });
  }
  return defaultTracer!;
}

/**
 * Returns the active metric registry instance.
 */
export function getMetricRegistry(): MetricRegistry {
  if (!defaultMetricRegistry) {
    initObservability({ useMemoryExporter: true });
  }
  return defaultMetricRegistry!;
}

/**
 * Returns pre-registered standard platform metrics.
 */
export function getStandardMetrics(): StandardMetrics {
  if (!defaultStandardMetrics) {
    initObservability({ useMemoryExporter: true });
  }
  return defaultStandardMetrics!;
}
