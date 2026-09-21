/**
 * @file packages/observability/src/tracing/span.ts
 * @description Concrete Span implementation recording events, attributes, and durations.
 */

import {
  type ISpan,
  type SpanContext,
  type SpanAttributes,
  type SpanEvent,
  type AttributeValue,
  SpanKind,
  StatusCode,
} from "./span.types";

/**
 * Concrete OpenTelemetry-compatible Span.
 */
export class Span implements ISpan {
  public readonly name: string;
  public readonly kind: SpanKind;
  public readonly parentSpanId?: string;

  private readonly context: SpanContext;
  private readonly attributes: Map<string, AttributeValue> = new Map();
  private readonly events: SpanEvent[] = [];
  private status: { code: StatusCode; description?: string } = { code: StatusCode.UNSET };

  private readonly startTimeMs: number;
  private endTimeMs?: number;
  private ended: boolean = false;

  constructor(
    name: string,
    context: SpanContext,
    parentSpanId?: string,
    kind: SpanKind = SpanKind.INTERNAL,
    private readonly onEndCallback?: (span: Span) => void,
  ) {
    this.name = name;
    this.context = context;
    this.parentSpanId = parentSpanId;
    this.kind = kind;
    this.startTimeMs = Date.now();
  }

  public spanContext(): SpanContext {
    return this.context;
  }

  public setAttribute(key: string, value: AttributeValue): this {
    if (!this.ended) {
      this.attributes.set(key, value);
    }
    return this;
  }

  public setAttributes(attributes: SpanAttributes): this {
    if (!this.ended) {
      for (const [k, v] of Object.entries(attributes)) {
        if (v !== undefined) {
          this.attributes.set(k, v);
        }
      }
    }
    return this;
  }

  public addEvent(name: string, attributes?: SpanAttributes): this {
    if (!this.ended) {
      const nowNanos = (BigInt(Date.now()) * 1_000_000n).toString();
      this.events.push({
        name,
        timeUnixNano: nowNanos,
        attributes,
      });
    }
    return this;
  }

  public setStatus(code: StatusCode, description?: string): this {
    if (!this.ended) {
      this.status = { code, description };
    }
    return this;
  }

  public recordException(exception: Error | string): this {
    const message = exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.setStatus(StatusCode.ERROR, message);
    this.addEvent("exception", {
      "exception.message": message,
      "exception.stacktrace": stack,
      "exception.type": exception instanceof Error ? exception.name : "Error",
    });
    return this;
  }

  public end(): void {
    if (this.ended) return;
    this.ended = true;
    this.endTimeMs = Date.now();
    this.onEndCallback?.(this);
  }

  public isEnded(): boolean {
    return this.ended;
  }

  public getDurationMs(): number {
    const end = this.endTimeMs ?? Date.now();
    return Math.max(0, end - this.startTimeMs);
  }

  public getAttributes(): Record<string, AttributeValue> {
    return Object.fromEntries(this.attributes.entries());
  }

  public getEvents(): ReadonlyArray<SpanEvent> {
    return this.events;
  }

  public getStatus(): { code: StatusCode; description?: string } {
    return this.status;
  }

  public getStartTimeMs(): number {
    return this.startTimeMs;
  }

  public getEndTimeMs(): number | undefined {
    return this.endTimeMs;
  }
}
