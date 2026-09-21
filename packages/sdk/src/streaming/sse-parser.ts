/**
 * @file packages/sdk/src/streaming/sse-parser.ts
 * @description Zero-dependency Server-Sent Events (SSE) stream decoder and message parser.
 */

import type { StreamEvent } from "@/types";

/**
 * Parses raw Uint8Array stream chunks into discrete Server-Sent Events.
 *
 * @param stream - Web ReadableStream of Uint8Array chunks
 * @returns AsyncGenerator yielding typed StreamEvent objects
 */
export async function* parseSseStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<StreamEvent, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r\n|\r|\n/);
      buffer = lines.pop() || "";

      let currentEvent: string = "message";
      let currentData: string = "";
      let currentId: string | undefined;

      for (const line of lines) {
        if (line === "") {
          // Empty line marks end of an event block
          if (currentData) {
            let parsedData: unknown = currentData;
            try {
              parsedData = JSON.parse(currentData);
            } catch {
              // Retain raw string data if not JSON
            }
            yield {
              event: currentEvent,
              data: parsedData,
              id: currentId,
            };
            currentEvent = "message";
            currentData = "";
            currentId = undefined;
          }
          continue;
        }

        if (line.startsWith(":")) {
          // Comment line (ping/heartbeat) — ignore
          continue;
        }

        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) continue;

        const field = line.slice(0, colonIndex).trim();
        const rawValue = line.slice(colonIndex + 1).trim();

        if (field === "event") {
          currentEvent = rawValue;
        } else if (field === "data") {
          currentData = currentData ? `${currentData}\n${rawValue}` : rawValue;
        } else if (field === "id") {
          currentId = rawValue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
