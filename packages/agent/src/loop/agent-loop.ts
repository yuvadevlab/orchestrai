/**
 * @file packages/agent/src/loop/agent-loop.ts
 * @description Core step controller and execution engine for autonomous agents.
 *
 * ─── The Agent Loop Engine (Learning note for AI Engineers) ─────────
 * An agent is defined by its ability to execute an iterative reasoning loop.
 *
 * Each cycle (`step()`):
 * 1. Mode Strategy & Tools: Mode filters which tools the agent can see.
 * 2. Prompt Compilation: Combines persona, instructions, context vars, and history.
 * 3. Model Invocation: Calls the LLM adapter to reason on next action.
 * 4. Tool Execution / HITL Guard:
 *    - If tool is DANGEROUS: pause execution, set WAITING_FOR_APPROVAL, return immediately.
 *    - If safe: execute via sandboxed ToolRunner and capture ToolResult.
 * 5. State & Loop Check: Guard against infinite loops or step exhaustion.
 * ───────────────────────────────────────────────────────────────────
 */

import crypto from "node:crypto";
import { MessageRole, ToolPermissionLevel, ToolResultStatus } from "@orchestrai/shared-types";
import {
  AIMessageSchema,
  requiresHumanApproval,
  type AIMessage,
  type AgentDefinition,
  type ToolResult,
} from "@orchestrai/core";
import type { ILlmAdapter } from "@orchestrai/models";
import { executeTool, type ToolRegistry } from "@orchestrai/tools";
import type { AgentStateMachine } from "@/state";
import { compilePrompt } from "@/compiler";
import { resolveModeStrategy } from "@/modes";
import type { AgentStepResult } from "./step-result.types";
import { extractToolCalls } from "./tool-message-converter";
import { runAgentUntilHalt, type AgentRunResult } from "./agent-runner";

/**
 * Configuration options required to instantiate an AgentLoop controller.
 */
export interface AgentLoopConfig {
  readonly definition: AgentDefinition;
  readonly state: AgentStateMachine;
  readonly adapter: ILlmAdapter;
  readonly tools: ToolRegistry;
  readonly clearance?: ToolPermissionLevel;
  readonly workspaceRoot?: string;
}

/**
 * Autonomous agent loop controller managing iterative reasoning, tool dispatch, and HITL pauses.
 */
export class AgentLoop {
  private readonly config: AgentLoopConfig;
  private readonly clearance: ToolPermissionLevel;

  constructor(config: AgentLoopConfig) {
    this.config = config;
    this.clearance = config.clearance ?? ToolPermissionLevel.READ_ONLY;
  }

  /**
   * Executes a single step of the agent loop against the current conversation history.
   *
   * @param history - Current array of conversation messages.
   * @returns Promise resolving to the AgentStepResult with outcome and tool results.
   */
  public async step(history: readonly AIMessage[]): Promise<AgentStepResult> {
    const stepIndex = this.config.state.advanceStep();
    const modeStrategy = resolveModeStrategy(this.config.definition.mode);

    // 1. Compile full prompt payload
    const compiledMessages = compilePrompt({
      systemPrompt: this.config.definition.systemPrompt,
      modeInstructions: modeStrategy.getSystemInstructions(),
      contextVariables: this.config.state.snapshot().contextVariables,
      history,
    });

    // 2. Invoke LLM via the model adapter
    const response = await this.config.adapter.invoke({
      model: this.config.definition.modelConfig.modelName,
      messages: compiledMessages,
      temperature: this.config.definition.modelConfig.temperature,
      maxTokens: this.config.definition.modelConfig.maxTokens,
      stream: false,
    });

    const assistantMessage: AIMessage = AIMessageSchema.parse({
      role: MessageRole.ASSISTANT,
      content: response.content,
    });

    const toolCalls = extractToolCalls(assistantMessage);

    // Case 1: Pure textual completion without tool calls
    if (toolCalls.length === 0) {
      const isDone = modeStrategy.shouldTerminate(false);
      if (isDone) {
        this.config.state.terminate();
      }

      return {
        stepIndex,
        outcome: isDone ? "HALTED" : "CONTINUE",
        assistantMessage,
        toolResults: [],
      };
    }

    // Case 2: Model emitted tool call(s)
    const toolResults: ToolResult[] = [];

    for (const call of toolCalls) {
      // Check for infinite repeating loops
      const isLoop = this.config.state.recordAction(call.toolName, call.arguments);
      if (isLoop) {
        return {
          stepIndex,
          outcome: "HALTED",
          assistantMessage,
          toolResults,
          error: `Infinite loop detected: agent invoked "${call.toolName}" repeatedly with identical arguments`,
        };
      }

      // Verify tool exists in registry
      const tool = this.config.tools.get(call.toolName);
      if (!tool) {
        toolResults.push({
          callId: call.callId,
          toolName: call.toolName,
          status: ToolResultStatus.ERROR,
          error: `Tool "${call.toolName}" is not registered or available`,
          durationMs: 0,
          timestamp: new Date(),
        });
        continue;
      }

      // Check Human-in-the-Loop clearance gate
      if (requiresHumanApproval(tool.definition.permissionLevel)) {
        const approvalId = crypto.randomUUID();
        this.config.state.setPendingApproval(approvalId);

        return {
          stepIndex,
          outcome: "WAITING_FOR_APPROVAL",
          assistantMessage,
          toolResults,
          pendingApproval: {
            approvalId,
            toolName: call.toolName,
            arguments: call.arguments,
            riskLevel: tool.definition.permissionLevel,
          },
        };
      }

      // Execute safe/cleared tool in sandbox
      const result = await executeTool(tool, call.callId, call.arguments, {
        agentClearance: this.clearance,
        context: {
          executionId: this.config.state.snapshot().executionId,
          agentId: this.config.state.snapshot().agentId,
          workspaceRoot: this.config.workspaceRoot,
        },
      });

      toolResults.push(result);
    }

    return {
      stepIndex,
      outcome: "CONTINUE",
      assistantMessage,
      toolResults,
    };
  }

  /**
   * Runs sequential loop steps continuously until HALTED, WAITING_FOR_APPROVAL, or ERROR.
   * Delegates to the modular runAgentUntilHalt runner function.
   *
   * @param initialHistory - Starting conversation history.
   * @param maxTurns - Safety circuit breaker for maximum loop rounds (default: 10).
   * @returns Completed history and terminal outcome.
   */
  public async runUntilHalt(
    initialHistory: readonly AIMessage[],
    maxTurns = 10,
  ): Promise<AgentRunResult> {
    return runAgentUntilHalt(this, initialHistory, maxTurns);
  }
}
