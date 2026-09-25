/**
 * @file apps/gateway/src/services/live-execution.manager.ts
 * @description Manages real-time LLM streaming, tool execution, and Human-in-the-Loop permission approval gates.
 * @module apps/gateway/services
 */

import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { OllamaAdapter } from "@orchestrai/models";
import { MessageRole, ExecutionStatus } from "@orchestrai/shared-types";
import type { GatewayResponse } from "@/routes/http-types";
import {
  extractToolCall,
  executeWorkspaceTool,
  formatToolArtifact,
  buildAutonomousSystemPrompt,
} from "./autonomous-agent-runner";
import { permissionPolicyManager } from "./permission-policy.manager";
import { attachExecutionSseStream, type ExecutionStreamState } from "./live-execution-broadcaster";

export type { ExecutionStreamState };

const MAX_AUTONOMOUS_TURNS = 5;

/**
 * LiveExecutionManager coordinates multi-turn LLM streaming and HITL permission gates to SSE listeners.
 */
class LiveExecutionManager {
  private readonly states = new Map<string, ExecutionStreamState>();
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  public getState(executionId: string): ExecutionStreamState | undefined {
    return this.states.get(executionId);
  }

  /**
   * Reconstructs initial conversation message history including system prompt and prior turns.
   */
  private buildInitialMessages(
    inputPrompt: string,
    systemPrompt?: string,
    history?: Array<{ role: string; content: string }>,
  ): Array<{
    id: string;
    role: MessageRole;
    content: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
  }> {
    const compositeSystemPrompt = buildAutonomousSystemPrompt(systemPrompt);
    const messages: Array<{
      id: string;
      role: MessageRole;
      content: string;
      metadata: Record<string, unknown>;
      createdAt: Date;
    }> = [
      {
        id: randomUUID(),
        role: MessageRole.SYSTEM,
        content: compositeSystemPrompt,
        metadata: {},
        createdAt: new Date(),
      },
    ];

    if (Array.isArray(history)) {
      for (const h of history) {
        if (!h.content) continue;
        const role = h.role.toLowerCase() === "user" ? MessageRole.USER : MessageRole.ASSISTANT;
        messages.push({
          id: randomUUID(),
          role,
          content: h.content,
          metadata: {},
          createdAt: new Date(),
        });
      }
    }

    messages.push({
      id: randomUUID(),
      role: MessageRole.USER,
      content: inputPrompt,
      metadata: {},
      createdAt: new Date(),
    });

    return messages;
  }

  /**
   * Starts autonomous execution with full conversation history and live tool execution.
   */
  public async startExecution(
    executionId: string,
    inputPrompt: string,
    modelName?: string,
    systemPrompt?: string,
    conversationId?: string,
    history?: Array<{ role: string; content: string }>,
  ): Promise<void> {
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const selectedModel = modelName || process.env.DEFAULT_MODEL_NAME || "gemma4:31b-cloud";
    const sessionId = conversationId || executionId;

    const state: ExecutionStreamState = {
      executionId,
      chunks: [],
      fullOutput: "",
      artifacts: [],
      status: ExecutionStatus.RUNNING,
    };
    this.states.set(executionId, state);

    try {
      const adapter = await OllamaAdapter.create({
        host,
        timeoutMs: 120000,
        defaultModel: selectedModel,
      });

      const conversationHistory = this.buildInitialMessages(inputPrompt, systemPrompt, history);

      for (let turn = 0; turn < MAX_AUTONOMOUS_TURNS; turn++) {
        const stream = adapter.stream({
          model: selectedModel,
          messages: conversationHistory,
          temperature: 0.7,
          stream: true,
        });

        let turnOutput = "";
        for await (const chunk of stream) {
          if (chunk.delta) {
            turnOutput += chunk.delta;
            state.chunks.push(chunk.delta);
            state.fullOutput += chunk.delta;
            this.emitter.emit(`chunk:${executionId}`, chunk.delta);
          }
        }

        const toolCall = extractToolCall(turnOutput);
        if (!toolCall) break;

        this.emitter.emit(`tool_call:${executionId}`, toolCall);

        // Security perimeter validation
        const perm = permissionPolicyManager.checkPermission(
          toolCall.tool,
          toolCall.args,
          sessionId,
        );
        let toolResult: { output: unknown; isError: boolean };

        if (!perm.allowed) {
          state.status = ExecutionStatus.WAITING_FOR_APPROVAL;
          const { request, promise } = permissionPolicyManager.createApprovalRequest(
            executionId,
            toolCall.tool,
            perm.target || "",
            perm.reason || "Clearance required",
            perm.suggestedPrefix,
          );
          state.pendingApproval = request;
          this.emitter.emit(`approval_request:${executionId}`, request);

          const decision = await promise;
          state.pendingApproval = undefined;

          if (!decision.granted) {
            state.status = ExecutionStatus.RUNNING;
            toolResult = {
              output: `Permission Denied by user for: ${perm.target}`,
              isError: true,
            };
          } else {
            state.status = ExecutionStatus.RUNNING;
            const updatedPerm = permissionPolicyManager.checkPermission(
              toolCall.tool,
              toolCall.args,
              sessionId,
            );
            toolResult = await executeWorkspaceTool(
              toolCall.tool,
              toolCall.args,
              updatedPerm.effectiveRoot,
            );
          }
        } else {
          toolResult = await executeWorkspaceTool(toolCall.tool, toolCall.args, perm.effectiveRoot);
        }

        const artifact = formatToolArtifact(toolCall.tool, toolCall.args, toolResult);
        state.artifacts.push(artifact);
        this.emitter.emit(`artifact:${executionId}`, artifact);

        conversationHistory.push({
          id: randomUUID(),
          role: MessageRole.ASSISTANT,
          content: turnOutput,
          metadata: {},
          createdAt: new Date(),
        });

        const toolFeedback =
          typeof toolResult.output === "object"
            ? JSON.stringify(toolResult.output)
            : String(toolResult.output);

        conversationHistory.push({
          id: randomUUID(),
          role: MessageRole.USER,
          content: `[Tool Execution Result for "${toolCall.tool}"]:\n${toolFeedback}\n\nPlease proceed to complete the task.`,
          metadata: {},
          createdAt: new Date(),
        });
      }

      state.status = ExecutionStatus.COMPLETED;
      state.completedAt = new Date().toISOString();
      this.emitter.emit(`done:${executionId}`, state.fullOutput);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      state.status = ExecutionStatus.FAILED;
      state.error = errMsg;
      state.completedAt = new Date().toISOString();
      this.emitter.emit(`error:${executionId}`, errMsg);
    }
  }

  public attachSseStream(executionId: string, res: GatewayResponse): void {
    const state = this.states.get(executionId);
    attachExecutionSseStream(executionId, state, this.emitter, res);
  }
}

export const liveExecutionManager = new LiveExecutionManager();
