/**
 * @file apps/gateway/src/modules/trace/trace.service.ts
 * @description In-memory OpenTelemetry trace collector serving execution waterfall spans.
 * @module apps/gateway/modules/trace
 */

import { InMemorySpanExporter, Tracer, type Span } from "@orchestrai/observability";
import { TRACE_ATTRIBUTES } from "@orchestrai/shared-types";

export interface SerializedSpan {
  id: string;
  name: string;
  parentSpanId?: string;
  startTimeMs: number;
  endTimeMs?: number;
  durationMs: number;
  status: { code: string; description?: string };
  attributes: Record<string, unknown>;
}

/**
 * Service collecting and querying active and finished execution spans.
 */
export class TraceService {
  private readonly exporter = new InMemorySpanExporter(2000);
  public readonly tracer: Tracer;

  constructor() {
    this.tracer = new Tracer("orchestrai-gateway", this.exporter);
  }

  /**
   * Retrieves all spans correlated with an execution identifier.
   */
  public getSpansForExecution(executionId: string): SerializedSpan[] {
    const finished: readonly Span[] = this.exporter.getFinishedSpans();
    const matched = finished.filter((s: Span) => {
      const attrs = s.getAttributes();
      return attrs[TRACE_ATTRIBUTES.EXECUTION_ID] === executionId;
    });

    return matched.map((s: Span) => ({
      id: s.spanContext().spanId,
      name: s.name,
      parentSpanId: s.parentSpanId,
      startTimeMs: s.getStartTimeMs(),
      endTimeMs: s.getEndTimeMs(),
      durationMs: s.getDurationMs(),
      status: s.getStatus(),
      attributes: s.getAttributes(),
    }));
  }

  /**
   * Retrieves recent traces across all executions.
   */
  public listRecentSpans(limit = 100): SerializedSpan[] {
    const finished: readonly Span[] = this.exporter.getFinishedSpans();
    return finished.slice(-limit).map((s: Span) => ({
      id: s.spanContext().spanId,
      name: s.name,
      parentSpanId: s.parentSpanId,
      startTimeMs: s.getStartTimeMs(),
      endTimeMs: s.getEndTimeMs(),
      durationMs: s.getDurationMs(),
      status: s.getStatus(),
      attributes: s.getAttributes(),
    }));
  }
}

/**
 * Singleton instance of TraceService for application-wide span collection.
 */
export const traceService = new TraceService();
