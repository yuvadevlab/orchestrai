/**
 * @file apps/gateway/src/services/trace.service.ts
 * @description In-memory OpenTelemetry trace collector serving execution waterfall spans.
 * @module apps/gateway/services
 */

import { InMemorySpanExporter, Tracer } from "@orchestrai/observability";

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
    const finished = this.exporter.getFinishedSpans();
    const matched = finished.filter((s) => {
      const attrs = s.getAttributes();
      return attrs["execution.id"] === executionId;
    });

    return matched.map((s) => ({
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
    const finished = this.exporter.getFinishedSpans();
    return finished.slice(-limit).map((s) => ({
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

export const traceService = new TraceService();
