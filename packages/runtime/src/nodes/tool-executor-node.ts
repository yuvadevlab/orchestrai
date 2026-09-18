/**
 * @file packages/runtime/src/nodes/tool-executor-node.ts
 * @description Tool execution node running cleared tools in the sandboxed runner.
 */

import { ToolResultStatus } from "@orchestrai/shared-types";
import type { AIMessage, ToolResult } from "@orchestrai/core";
import { executeTool } from "@orchestrai/tools";
import { createToolResultMessage } from "@orchestrai/agent";
import type { NodeFunction } from "@/graph";
import type { RuntimeGraphState, RuntimeNodeDependencies } from "./node.types";

/**
 * Creates the ToolExecutorNode handler.
 * Dispatches all approved or safe pending tool calls through the sandboxed runner.
 *
 * @param deps - Runtime dependencies (tools, permissions, workspace sandbox).
 * @returns NodeFunction executing pending tools and appending results to history.
 */
export function createToolExecutorNode(
  deps: RuntimeNodeDependencies,
): NodeFunction<RuntimeGraphState> {
  return async (state: Readonly<RuntimeGraphState>): Promise<Partial<RuntimeGraphState>> => {
    const calls = state.pendingToolCalls ?? [];
    const results: ToolResult[] = [];
    const resultMessages: AIMessage[] = [];

    for (const call of calls) {
      const tool = deps.tools.get(call.toolName);
      if (!tool) {
        const errorResult: ToolResult = {
          callId: call.callId,
          toolName: call.toolName,
          status: ToolResultStatus.ERROR,
          error: `Tool "${call.toolName}" was not found in the runtime registry`,
          durationMs: 0,
          timestamp: new Date(),
        };
        results.push(errorResult);
        resultMessages.push(createToolResultMessage(errorResult));
        continue;
      }

      const outcome = await executeTool(tool, call.callId, call.arguments, {
        agentClearance: deps.clearance,
        context: {
          executionId: state.executionId,
          agentId: state.agent.agentId,
          workspaceRoot: deps.workspaceRoot,
        },
      });

      results.push(outcome);
      resultMessages.push(createToolResultMessage(outcome));
    }

    return {
      history: [...state.history, ...resultMessages],
      lastToolResults: results,
      pendingToolCalls: undefined,
    };
  };
}
