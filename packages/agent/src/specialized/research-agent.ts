/**
 * @file research-agent.ts
 * @description Specialized Research Agent conducting multi-query retrieval and citation synthesis.
 * @module @orchestrai/agent/specialized
 */

import { AgentMode } from "@orchestrai/shared-types";
import { RESEARCHER_PERSONA_PROMPT } from "@orchestrai/prompts";
import { AgentBuilder } from "../builder/agent-builder";
import { AgentDefinition, AGENT_EXECUTION_DEFAULTS } from "@orchestrai/core";

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
  const builder = new AgentBuilder()
    .withName(options?.name ?? "Research Assistant")
    .withDescription(
      "Specialized agent executing multi-step web research, document parsing, and citation synthesis.",
    )
    .withMode(AgentMode.PLAN)
    .withSystemPrompt(RESEARCHER_PERSONA_PROMPT)
    .withTools(["http_fetch", "read_file", "list_directory"])
    .withMaxSteps(options?.maxSteps ?? AGENT_EXECUTION_DEFAULTS.DEFAULT_MAX_STEPS);

  if (options?.model) {
    builder.withModel({
      modelName: options.model,
      temperature: AGENT_EXECUTION_DEFAULTS.FACTUAL_TEMPERATURE,
    });
  } else {
    builder.withModel({
      temperature: AGENT_EXECUTION_DEFAULTS.FACTUAL_TEMPERATURE,
    });
  }

  return builder.build();
}
