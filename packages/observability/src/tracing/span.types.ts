/**
 * @file packages/observability/src/tracing/span.types.ts
 * @description Standard OpenTelemetry-compatible span types, interfaces, and enums.
 */

/**
 * OpenTelemetry Span Kind indicating relationship to callers.
 */
export enum SpanKind {
  INTERNAL = "INTERNAL",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
  PRODUCER = "PRODUCER",
  CONSUMER = "CONSUMER",
}

/**
 * OpenTelemetry Span status code.
 */
export enum StatusCode {
  UNSET = "UNSET",
  OK = "OK",
  ERROR = "ERROR",
}

/**
 * Primitive attribute values attachable to a Span.
 */
export type AttributeValue = string | number | boolean | string[] | number[] | boolean[];

/**
 * Map of span attributes.
 */
export type SpanAttributes = Record<string, AttributeValue | undefined>;

/**
 * Structured point-in-time event recorded within a Span.
 */
export interface SpanEvent {
  name: string;
  timeUnixNano: string;
  attributes?: SpanAttributes;
}

/**
 * Immutable context identifying an individual Span within a trace tree.
 */
export interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
}

/**
 * Standard Span contract representing an instrumented unit of computation.
 */
export interface ISpan {
  readonly name: string;
  readonly kind: SpanKind;
  readonly parentSpanId?: string;
  spanContext(): SpanContext;
  setAttribute(key: string, value: AttributeValue): this;
  setAttributes(attributes: SpanAttributes): this;
  addEvent(name: string, attributes?: SpanAttributes): this;
  setStatus(code: StatusCode, description?: string): this;
  recordException(exception: Error | string): this;
  end(): void;
  isEnded(): boolean;
  getDurationMs(): number;
}
