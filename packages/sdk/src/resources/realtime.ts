/**
 * @file packages/sdk/src/resources/realtime.ts
 * @description Dedicated streaming client resource connecting to OrchestrAI Realtime broker.
 * @module @orchestrai/sdk/resources
 */

import { SseStreamEvent, type SseEventEnvelope } from "@orchestrai/shared-types";
import { ResourceBase } from "./resource-base";
import type { OrchestrAIClientOptions } from "../types";
import type { HttpClient } from "../transport";

/**
 * Event listener callback for incoming SSE wire envelopes.
 */
export type SseEventListener = (event: SseEventEnvelope) => void;

/**
 * Client resource managing persistent SSE and WebSocket connections to apps/realtime.
 */
export class RealtimeResource extends ResourceBase {
  private readonly realtimeUrl: string;

  constructor(http: HttpClient, options: OrchestrAIClientOptions = {}) {
    super(http, options);
    this.realtimeUrl = options.realtimeUrl || options.baseUrl || "http://localhost:4002";
  }

  /**
   * Subscribes to real-time execution events, streaming tokens, artifacts, and approval tickets.
   *
   * @param executionId - Identifier of execution to stream
   * @param onEvent - Callback dispatched for each incoming SSE event envelope
   * @returns AbortController to terminate the streaming subscription
   */
  public subscribeToExecution(executionId: string, onEvent: SseEventListener): AbortController {
    const controller = new AbortController();
    const endpoint = `${this.realtimeUrl}/api/v1/executions/${encodeURIComponent(executionId)}/stream`;

    void (async () => {
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            Accept: "text/event-stream",
            ...(this.options.token ? { Authorization: `Bearer ${this.options.token}` } : {}),
            ...(this.options.apiKey ? { "x-api-key": this.options.apiKey } : {}),
            ...(this.options.tenantId ? { "x-tenant-id": this.options.tenantId } : {}),
          },
        });

        if (!response.ok || !response.body) {
          throw new Error(`Realtime SSE subscription failed with HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = SseStreamEvent.CHUNK;
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim() as SseStreamEvent;
            } else if (line.startsWith("data: ")) {
              const rawData = line.slice(6);
              try {
                const parsed = JSON.parse(rawData);
                onEvent({ event: currentEvent, data: parsed });
              } catch {
                onEvent({ event: currentEvent, data: rawData as unknown as never });
              }
            }
          }
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          onEvent({
            event: SseStreamEvent.ERROR,
            data: {
              executionId,
              error: err instanceof Error ? err.message : "Stream connection terminated",
              recoverable: false,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
    })();

    return controller;
  }
}
