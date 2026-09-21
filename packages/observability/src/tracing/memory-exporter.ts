/**
 * @file packages/observability/src/tracing/memory-exporter.ts
 * @description Thread-safe in-memory span exporter for development, testing, and inspection.
 */

import type { ISpanExporter } from "./span-exporter.interface";
import type { Span } from "./span";

/**
 * In-memory telemetry exporter retaining finished spans for local inspection.
 */
export class InMemorySpanExporter implements ISpanExporter {
  private readonly finishedSpans: Span[] = [];
  private readonly maxLimit: number;

  constructor(maxLimit: number = 1000) {
    this.maxLimit = maxLimit;
  }

  public async export(spans: ReadonlyArray<Span>): Promise<void> {
    for (const span of spans) {
      if (this.finishedSpans.length >= this.maxLimit) {
        this.finishedSpans.shift(); // Evict oldest
      }
      this.finishedSpans.push(span);
    }
  }

  public getFinishedSpans(): ReadonlyArray<Span> {
    return [...this.finishedSpans];
  }

  public clear(): void {
    this.finishedSpans.length = 0;
  }

  public async shutdown(): Promise<void> {
    this.clear();
  }
}
