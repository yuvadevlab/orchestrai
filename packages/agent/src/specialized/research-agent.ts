/**
 * @file research-agent.ts
 * @description Specialized Research Agent conducting multi-query retrieval and citation synthesis.
 * @module @orchestrai/agent/specialized
 */

import { AgentMode, ModelProvider } from "@orchestrai/shared-types";
import { AgentBuilder } from "../builder/agent-builder";
import { AgentDefinition } from "@orchestrai/core";

/** Configuration options for initializing a ResearchAgent */
export interface ResearchAgentOptions {
  readonly name?: string;
  readonly model?: string;
  readonly maxSteps?: number;
}

/**
 * Creates a specialized Research Agent configured for deep information synthesis.
 *
 * @param options - Research agent configuration options.
 * @returns Configured AgentDefinition instance.
 */
export function createResearchAgent(options?: ResearchAgentOptions): AgentDefinition {
  return new AgentBuilder()
    .withName(options?.name ?? "Research Assistant")
    .withDescription(
      "Specialized agent executing multi-step web research, document parsing, and citation synthesis.",
    )
    .withMode(AgentMode.PLAN)
    .withSystemPrompt(
      "You are a specialized Research Agent. Your task is to inspect facts, retrieve relevant documents, verify sources, and synthesize comprehensive reports with structured citations.",
    )
    .withModel({
      provider: ModelProvider.OPENAI,
      modelName: options?.model ?? "gpt-4o-mini",
      temperature: 0.2,
    })
    .withTools(["http_fetch", "read_file", "list_directory"])
    .withMaxSteps(options?.maxSteps ?? 20)
    .build();
}
