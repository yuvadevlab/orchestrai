/**
 * @file packages/observability/src/tracing/otlp-exporter.ts
 * @description Standard zero-dependency OTLP HTTP JSON exporter transmitting traces to OTel Collector.
 */

import type { ISpanExporter } from "./span-exporter.interface";
import type { Span } from "./span";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("OtlpExporter"));

/**
 * Exporter posting standard OTLP JSON spans to an OpenTelemetry Collector HTTP endpoint.
 */
export class OtlpHttpSpanExporter implements ISpanExporter {
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;

  constructor(
    endpoint: string = "http://localhost:4318/v1/traces",
    headers: Record<string, string> = {},
  ) {
    this.endpoint = endpoint;
    this.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  public async export(spans: ReadonlyArray<Span>): Promise<void> {
    if (spans.length === 0) return;

    const payload = {
      resourceSpans: [
        {
          resource: {
            attributes: [{ key: "service.name", value: { stringValue: "orchestrai" } }],
          },
          scopeSpans: [
            {
              scope: { name: "@orchestrai/observability", version: "0.1.0" },
              spans: spans.map((s) => ({
                traceId: s.spanContext().traceId,
                spanId: s.spanContext().spanId,
                parentSpanId: s.parentSpanId || "",
                name: s.name,
                kind: s.kind,
                startTimeUnixNano: (BigInt(s.getStartTimeMs()) * 1_000_000n).toString(),
                endTimeUnixNano: (
                  BigInt(s.getEndTimeMs() || s.getStartTimeMs()) * 1_000_000n
                ).toString(),
                attributes: Object.entries(s.getAttributes()).map(([k, v]) => ({
                  key: k,
                  value: typeof v === "string" ? { stringValue: v } : { intValue: String(v) },
                })),
                status: {
                  code: s.getStatus().code,
                  message: s.getStatus().description || "",
                },
              })),
            },
          ],
        },
      ],
    };

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      logger.warn("Failed to export trace spans to OTLP collector", {
        endpoint: this.endpoint,
        error: String(err),
      });
    }
  }

  public async shutdown(): Promise<void> {
    // No-op for HTTP client
  }
}
