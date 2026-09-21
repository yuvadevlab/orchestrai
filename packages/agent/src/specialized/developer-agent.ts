/**
 * @file developer-agent.ts
 * @description Specialized Developer Agent for code editing, AST parsing, and sandboxed test execution.
 * @module @orchestrai/agent/specialized
 */

import { AgentMode, ModelProvider } from "@orchestrai/shared-types";
import { AgentBuilder } from "../builder/agent-builder";
import { AgentDefinition } from "@orchestrai/core";

/** Configuration options for initializing a DeveloperAgent */
export interface DeveloperAgentOptions {
  readonly name?: string;
  readonly model?: string;
  readonly maxSteps?: number;
}

/**
 * Creates a specialized Developer Agent configured for code generation, refactoring, and sandbox execution.
 *
 * @param options - Developer agent configuration options.
 * @returns Configured AgentDefinition instance.
 */
export function createDeveloperAgent(options?: DeveloperAgentOptions): AgentDefinition {
  return new AgentBuilder()
    .withName(options?.name ?? "Developer Assistant")
    .withDescription(
      "Specialized software engineering agent performing code refactoring, AST inspection, and sandboxed tests.",
    )
    .withMode(AgentMode.ACT)
    .withSystemPrompt(
      "You are a specialized Developer Agent. Your objective is to write clean, type-safe, maintainable code adhering strictly to invariants, sub-250 line file limits, and comprehensive JSDoc documentation.",
    )
    .withModel({
      provider: ModelProvider.ANTHROPIC,
      modelName: options?.model ?? "claude-3-5-sonnet-20241022",
      temperature: 0.1,
    })
    .withTools(["read_file", "write_file", "list_directory", "bash"])
    .withMaxSteps(options?.maxSteps ?? 30)
    .build();
}
