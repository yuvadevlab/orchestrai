/**
 * @file apps/gateway/src/services/live-execution-broadcaster.ts
 * @description Event broadcaster and SSE subscription manager for live agent executions.
 * @module apps/gateway/services
 */

import { EventEmitter } from "node:events";
import { ExecutionStatus } from "@orchestrai/shared-types";
import type { GatewayResponse } from "@/routes/http-types";
import type { ToolArtifact } from "./autonomous-agent-runner";
import type { ApprovalRequest } from "./permission-policy.manager";

export interface ExecutionStreamState {
  executionId: string;
  chunks: string[];
  fullOutput: string;
  artifacts: ToolArtifact[];
  status: ExecutionStatus;
  pendingApproval?: ApprovalRequest;
  error?: string;
  completedAt?: string;
}

/**
 * Attaches a Server-Sent Events HTTP response to real-time execution events.
 */
export function attachExecutionSseStream(
  executionId: string,
  state: ExecutionStreamState | undefined,
  emitter: EventEmitter,
  res: GatewayResponse,
): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Replay buffered artifacts, approval requests, and text chunks
  if (state?.artifacts.length) {
    for (const artifact of state.artifacts) {
      res.write(`event: artifact\ndata: ${JSON.stringify(artifact)}\n\n`);
    }
  }
  if (state?.pendingApproval) {
    res.write(`event: approval_request\ndata: ${JSON.stringify(state.pendingApproval)}\n\n`);
  }
  if (state?.chunks.length) {
    for (const chunk of state.chunks) {
      res.write(`event: message\ndata: ${JSON.stringify(chunk)}\n\n`);
    }
  }

  // Handle already-terminal state
  if (state?.status === ExecutionStatus.COMPLETED) {
    res.write(`event: done\ndata: "[DONE]"\n\n`);
    res.end();
    return;
  }
  if (state?.status === ExecutionStatus.FAILED) {
    res.write(`event: error\ndata: ${JSON.stringify(state.error)}\n\n`);
    res.end();
    return;
  }

  const chunkHandler = (delta: string): void => {
    res.write(`event: message\ndata: ${JSON.stringify(delta)}\n\n`);
  };
  const artifactHandler = (art: ToolArtifact): void => {
    res.write(`event: artifact\ndata: ${JSON.stringify(art)}\n\n`);
  };
  const toolCallHandler = (tc: unknown): void => {
    res.write(`event: tool_call\ndata: ${JSON.stringify(tc)}\n\n`);
  };
  const approvalHandler = (req: ApprovalRequest): void => {
    res.write(`event: approval_request\ndata: ${JSON.stringify(req)}\n\n`);
  };
  const doneHandler = (): void => {
    res.write(`event: done\ndata: "[DONE]"\n\n`);
    cleanup();
    res.end();
  };
  const errorHandler = (err: string): void => {
    res.write(`event: error\ndata: ${JSON.stringify(err)}\n\n`);
    cleanup();
    res.end();
  };

  const cleanup = (): void => {
    emitter.off(`chunk:${executionId}`, chunkHandler);
    emitter.off(`artifact:${executionId}`, artifactHandler);
    emitter.off(`tool_call:${executionId}`, toolCallHandler);
    emitter.off(`approval_request:${executionId}`, approvalHandler);
    emitter.off(`done:${executionId}`, doneHandler);
    emitter.off(`error:${executionId}`, errorHandler);
  };

  emitter.on(`chunk:${executionId}`, chunkHandler);
  emitter.on(`artifact:${executionId}`, artifactHandler);
  emitter.on(`tool_call:${executionId}`, toolCallHandler);
  emitter.on(`approval_request:${executionId}`, approvalHandler);
  emitter.on(`done:${executionId}`, doneHandler);
  emitter.on(`error:${executionId}`, errorHandler);
  res.on("close", cleanup);
}
