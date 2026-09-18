/**
 * @file packages/runtime/src/nodes/model-node.ts
 * @description Model invocation node responsible for LLM reasoning and response capture.
 */

import { MessageRole } from "@orchestrai/shared-types";
import { AIMessageSchema, type AIMessage } from "@orchestrai/core";
import { compilePrompt, extractToolCalls, resolveModeStrategy } from "@orchestrai/agent";
import type { NodeFunction } from "@/graph";
import type { RuntimeGraphState, RuntimeNodeDependencies } from "./node.types";

/**
 * Creates the ModelNode handler function.
 *
 * @param deps - Runtime dependencies (model adapter, tool registry).
 * @returns NodeFunction executing prompt compilation and model invocation.
 */
export function createModelNode(deps: RuntimeNodeDependencies): NodeFunction<RuntimeGraphState> {
  return async (state: Readonly<RuntimeGraphState>): Promise<Partial<RuntimeGraphState>> => {
    const modeStrategy = resolveModeStrategy(state.agent.mode);

    // 1. Compile prompt layers
    const compiledMessages = compilePrompt({
      systemPrompt: state.agent.systemPrompt,
      modeInstructions: modeStrategy.getSystemInstructions(),
      contextVariables: state.contextVariables,
      history: state.history,
    });

    // 2. Invoke model adapter
    const response = await deps.adapter.invoke({
      model: state.agent.modelConfig.modelName,
      messages: compiledMessages,
      temperature: state.agent.modelConfig.temperature,
      maxTokens: state.agent.modelConfig.maxTokens,
      stream: false,
    });

    // 3. Format assistant message with schema defaults
    const assistantMessage: AIMessage = AIMessageSchema.parse({
      role: MessageRole.ASSISTANT,
      content: response.content,
    });

    const pendingToolCalls = extractToolCalls(assistantMessage);
    const hasToolCalls = pendingToolCalls.length > 0;
    const shouldHalt = modeStrategy.shouldTerminate(hasToolCalls);

    return {
      history: [...state.history, assistantMessage],
      pendingToolCalls: hasToolCalls ? pendingToolCalls : undefined,
      isTerminated: shouldHalt,
    };
  };
}
