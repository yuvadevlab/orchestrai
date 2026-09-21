/**
 * @file packages/observability/src/tracing/span-exporter.interface.ts
 * @description Contract for span exporters publishing finished traces to backends or memory.
 */

import type { Span } from "./span";

/**
 * Interface implemented by telemetry trace exporters.
 */
export interface ISpanExporter {
  /**
   * Exports a batch of finished spans.
   *
   * @param spans - Array of finished Span objects
   */
  export(spans: ReadonlyArray<Span>): Promise<void>;

  /**
   * Flushes and terminates the exporter.
   */
  shutdown(): Promise<void>;
}
