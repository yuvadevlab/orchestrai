# Phase 19: `packages/observability` & `infrastructure/monitoring` — Observability & OpenTelemetry

## Objectives

Establish the comprehensive observability and distributed telemetry subsystem (`@orchestrai/observability`) and monitoring infrastructure (`infrastructure/monitoring/`) for OrchestrAI, providing:

1. **Clean Separation of Concerns (Section 68)**:
   - **`packages/observability`**: Shared TypeScript telemetry SDK providing OpenTelemetry tracing, Prometheus metric registry, correlation propagation, and zero-leak redaction.
   - **`infrastructure/monitoring/`**: Isolated deployment manifests (Prometheus scrape configs, OpenTelemetry Collector config, Docker Compose stack).

2. **Distributed Tracing & W3C TraceContext (`src/tracing/` & `src/context/`)**:
   - Trace propagation across all tiers: `Gateway -> Queue -> Worker -> Runtime -> Model -> Tool -> Postgres`.
   - Standard W3C `traceparent` (`00-${traceId}-${spanId}-${flags}`) and baggage injection/extraction.
   - `AsyncLocalStorage`-backed ambient correlation context tracking `traceId`, `spanId`, `executionId`, `tenantId`, `userId`, `correlationId`.
   - OpenTelemetry-compatible `Span` and `Tracer` classes with lifecycle timestamps, event records, and attributes.
   - Pluggable exporters: `InMemorySpanExporter` and zero-dependency `OtlpHttpSpanExporter` transmitting to OTel Collector (`:4318/v1/traces`).

3. **Prometheus Metrics Engine (`src/metrics/`)**:
   - `Counter`, `Gauge`, and `Histogram` in-memory instruments with label sets.
   - Pre-registered standard platform metrics according to Section 72:
     - **Agent**: `agent_executions_total`, `agent_execution_duration_ms`, `agent_failures_total`, `active_executions`
     - **LLM**: `llm_requests_total`, `llm_duration_ms`, `llm_errors_total`, `llm_tokens_input_total`, `llm_tokens_output_total`
     - **Tools**: `tool_calls_total`, `tool_duration_ms`, `tool_failures_total`
     - **Queue**: `queue_depth`, `job_duration_ms`, `job_failures_total`
     - **Realtime**: `realtime_active_connections`, `realtime_messages_total`, `realtime_disconnects_total`, `realtime_message_latency_ms`
   - Official Prometheus text exposition serializer (`serializeToPrometheusText`) for `/metrics` HTTP endpoints.

4. **Sensitive Data Redaction & Logging (`src/logging/`)**:
   - Zero-leak recursive sanitizer redacting passwords, API keys, Bearer tokens, private secrets, and credit cards from telemetry attributes.
   - Log context enricher merging ambient `traceId` and `spanId` into structured log entries.

5. **Monitoring Infrastructure (`infrastructure/monitoring/`)**:
   - `prometheus.yml`: Scrapes Gateway (`:8000`), Realtime (`:8001`), Worker (`:9100`), and OTel Collector (`:8889`).
   - `otel-collector-config.yml`: Pipelines for OTLP gRPC/HTTP traces and metrics routing to Prometheus and debug exporters.
   - `docker-compose.monitoring.yml`: Local Docker Compose stack with Prometheus, Grafana, and OpenTelemetry Collector.

---

## Directory Structure

```text
packages/observability/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
└── src/
    ├── context/
    │   ├── correlation-context.ts      # AsyncLocalStorage context store
    │   ├── propagation.ts              # W3C traceparent parser & injector
    │   └── index.ts
    ├── tracing/
    │   ├── span.types.ts               # SpanKind, StatusCode, ISpan, ITracer
    │   ├── span.ts                     # Concrete OpenTelemetry Span
    │   ├── span-exporter.interface.ts  # ISpanExporter contract
    │   ├── memory-exporter.ts          # In-memory exporter for testing
    │   ├── otlp-exporter.ts            # HTTP OTLP JSON trace exporter
    │   ├── tracer.ts                   # Master Tracer coordinating spans
    │   └── index.ts
    ├── metrics/
    │   ├── metric.types.ts             # MetricType, ICounter, IGauge, IHistogram
    │   ├── metric-instruments.ts       # Counter, Gauge, Histogram classes
    │   ├── metric-registry.ts          # MetricRegistry container
    │   ├── standard-metrics.ts         # Section 72 standard platform metrics
    │   ├── prometheus-serializer.ts    # Prometheus text format serializer
    │   └── index.ts
    ├── logging/
    │   ├── sensitive-data-redactor.ts  # Recursive secret sanitizer
    │   ├── log-context-enricher.ts     # Ambient trace context log enricher
    │   └── index.ts
    └── index.ts                        # Master facade & getTracer / getMetrics helpers

infrastructure/monitoring/
├── prometheus.yml                      # Scrape config for Gateway, Realtime, Worker
├── otel-collector-config.yml           # OTLP Collector pipelines
└── docker-compose.monitoring.yml       # Prometheus + Grafana + OTel stack
```

---

## Verification & Quality Gates

- `pnpm --filter @orchestrai/observability build`: Passed cleanly (`ESM: 58ms`, `CJS: 58ms`, `DTS: 369ms`).
- `pnpm typecheck`: 26 tasks passed across all 18 workspace projects.
- `pnpm lint`: Zero warnings (`--max-warnings=0`).
- `pnpm build`: 17 tasks passed across all monorepo packages.
- Line limit invariant: All 20 files in `packages/observability/src/` are strictly < 140 lines (limit: 250).
