/**
 * @file packages/sdk/src/resources/execution-handle.ts
 * @description Fluent execution handle providing streaming, polling, and lifecycle control methods.
 */

import type { Execution, StreamEvent } from "@/types";
import type { HttpClient } from "@/transport";
import { StreamIterator } from "@/streaming";
import { ExecutionStatus } from "@orchestrai/shared-types";

/**
 * Ergonomic controller handle returned when an agent execution is launched.
 */
export class ExecutionHandle {
  public readonly id: string;
  public readonly agentId: string;
  public readonly conversationId: string;
  private currentStatus: ExecutionStatus;

  constructor(
    initial: Execution,
    private readonly http: HttpClient,
    private readonly realtimeUrl?: string,
  ) {
    this.id = initial.executionId;
    this.agentId = initial.agentId;
    this.conversationId = initial.conversationId;
    this.currentStatus = initial.status;
  }

  /**
   * Latest known status of the execution.
   */
  public get status(): ExecutionStatus {
    return this.currentStatus;
  }

  /**
   * Connects to the SSE event stream for live tokens and state transitions.
   */
  public async stream(): Promise<StreamIterator<StreamEvent>> {
    const streamPath = `/api/v1/stream?executionId=${encodeURIComponent(this.id)}`;
    const streamEndpoint = this.realtimeUrl
      ? `${this.realtimeUrl.replace(/\/$/, "")}${streamPath}`
      : streamPath;

    const rawStream = await this.http.requestStream(streamEndpoint);
    return new StreamIterator(rawStream);
  }

  /**
   * Polls execution state until terminal completion (COMPLETED, FAILED, or CANCELLED).
   */
  public async wait(pollIntervalMs: number = 1000, timeoutMs: number = 60000): Promise<Execution> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const record = await this.http.request<Execution>(`/api/v1/executions/${this.id}`);
      this.currentStatus = record.status;

      if (
        record.status === ExecutionStatus.COMPLETED ||
        record.status === ExecutionStatus.FAILED ||
        record.status === ExecutionStatus.CANCELLED
      ) {
        return record;
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Execution ${this.id} did not terminate within ${timeoutMs}ms`);
  }

  /**
   * Explicitly cancels the active execution.
   */
  public async cancel(): Promise<Execution> {
    const record = await this.http.request<Execution>(`/api/v1/executions/${this.id}/cancel`, {
      method: "POST",
    });
    this.currentStatus = record.status;
    return record;
  }

  /**
   * Resumes execution from an approval or paused state.
   */
  public async resume(
    options: { action?: "RESUME" | "RETRY"; feedback?: string } = {},
  ): Promise<Execution> {
    const record = await this.http.request<Execution>(`/api/v1/executions/${this.id}/resume`, {
      method: "POST",
      body: { action: options.action || "RESUME", feedback: options.feedback },
    });
    this.currentStatus = record.status;
    return record;
  }
}
