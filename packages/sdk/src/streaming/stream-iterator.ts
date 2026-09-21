/**
 * @file packages/sdk/src/streaming/stream-iterator.ts
 * @description AsyncIterableIterator wrapper facilitating for-await-of consumption of SSE streams.
 */

import type { StreamEvent } from "@/types";
import { parseSseStream } from "./sse-parser";

/**
 * Ergonomic stream container implementing AsyncIterable for clean for-await loops.
 */
export class StreamIterator<T = StreamEvent> implements AsyncIterable<T> {
  constructor(private readonly rawStream: ReadableStream<Uint8Array>) {}

  /**
   * Implements standard AsyncIterator interface.
   */
  public async *[Symbol.asyncIterator](): AsyncIterator<T> {
    for await (const event of parseSseStream(this.rawStream)) {
      yield event as unknown as T;
    }
  }

  /**
   * Collects all remaining stream items into an in-memory array.
   */
  public async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }
}
