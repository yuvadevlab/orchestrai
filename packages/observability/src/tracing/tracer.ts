/**
 * @file packages/observability/src/tracing/tracer.ts
 * @description Master Tracer coordinating span creation, nesting, and export batching.
 */

import { generateSpanId, generateTraceId, getCorrelationContext, runWithContext } from "@/context";
import { Span } from "./span";
import { type ISpan, SpanKind, StatusCode, type SpanAttributes } from "./span.types";
import type { ISpanExporter } from "./span-exporter.interface";
import { InMemorySpanExporter } from "./memory-exporter";

export interface SpanOptions {
  kind?: SpanKind;
  attributes?: SpanAttributes;
  parentSpanId?: string;
  traceId?: string;
}

/**
 * OpenTelemetry Tracer coordinating span hierarchy and telemetry publication.
 */
export class Tracer {
  private readonly exporter: ISpanExporter;
  private readonly serviceName: string;

  constructor(
    serviceName: string = "orchestrai",
    exporter: ISpanExporter = new InMemorySpanExporter(),
  ) {
    this.serviceName = serviceName;
    this.exporter = exporter;
  }

  /**
   * Starts a new span without altering ambient context.
   */
  public startSpan(name: string, options: SpanOptions = {}): Span {
    const parentContext = getCorrelationContext();
    const traceId = options.traceId || parentContext.traceId || generateTraceId();
    const parentSpanId = options.parentSpanId || parentContext.spanId;
    const spanId = generateSpanId();

    const span = new Span(
      name,
      { traceId, spanId, traceFlags: 1 },
      parentSpanId,
      options.kind || SpanKind.INTERNAL,
      (finishedSpan) => {
        void this.exporter.export([finishedSpan]);
      },
    );

    span.setAttribute("service.name", this.serviceName);
    if (options.attributes) {
      span.setAttributes(options.attributes);
    }

    return span;
  }

  /**
   * Executes an async operation within the scope of an active Span, auto-completing on return.
   */
  public async startActiveSpan<T>(
    name: string,
    fn: (span: ISpan) => Promise<T> | T,
    options: SpanOptions = {},
  ): Promise<T> {
    const span = this.startSpan(name, options);
    const spanCtx = span.spanContext();

    return runWithContext(
      {
        traceId: spanCtx.traceId,
        spanId: spanCtx.spanId,
      },
      async () => {
        try {
          const result = await fn(span);
          if (span.getStatus().code === StatusCode.UNSET) {
            span.setStatus(StatusCode.OK);
          }
          return result;
        } catch (err) {
          span.recordException(err as Error);
          throw err;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Accessor for underlying span exporter.
   */
  public getExporter(): ISpanExporter {
    return this.exporter;
  }
}
