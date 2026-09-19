/**
 * @file apps/realtime/src/sse/sse-channel.ts
 * @description Utilities for formatting and flushing Server-Sent Events (SSE) line protocol.
 */

import type { ServerResponse } from "node:http";

/**
 * Configures an HTTP response for SSE streaming with correct protocol headers.
 *
 * @param res - Raw Node.js HTTP response to configure
 * @param corsOrigin - Allowed origin header value for CORS enforcement
 */
export function configureSseHeaders(res: ServerResponse, corsOrigin = "*"): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "X-Accel-Buffering": "no",
  });
}

/**
 * Formats an SSE event frame and sends it to a response stream.
 *
 * @param res - Active HTTP SSE response
 * @param eventType - Logical event name (e.g., 'step_completed', 'token')
 * @param data - Serializable data to embed in the data field
 * @param id - Optional event ID for client-side reconnection tracking
 */
export function sendSseEvent(
  res: ServerResponse,
  eventType: string,
  data: unknown,
  id?: string,
): void {
  // Invariant: All SSE events must carry a valid event name and JSON-serialized data
  let frame = "";
  if (id) {
    frame += `id: ${id}\n`;
  }
  frame += `event: ${eventType}\n`;
  frame += `data: ${JSON.stringify(data)}\n\n`;

  if (!res.writableEnded) {
    res.write(frame);
  }
}

/**
 * Sends an SSE keepalive comment to prevent upstream proxies from closing idle connections.
 *
 * @param res - Active HTTP SSE response
 */
export function sendSseKeepalive(res: ServerResponse): void {
  // Invariant: Proxy/CDN often close idle HTTP connections after 30-60s without data
  if (!res.writableEnded) {
    res.write(": keep-alive\n\n");
  }
}

/**
 * Terminates an SSE stream gracefully by writing a final 'end' event and closing the response.
 *
 * @param res - Active HTTP SSE response
 * @param reason - Human-readable reason for stream termination
 */
export function closeSseStream(res: ServerResponse, reason = "Stream closed"): void {
  if (!res.writableEnded) {
    sendSseEvent(res, "close", { reason });
    res.end();
  }
}
