/**
 * @file packages/agent/src/compiler/compiler.types.ts
 * @description Types and options for the agent prompt compilation pipeline.
 */

import type { AIMessage } from "@orchestrai/core";

/**
 * Configuration options provided to the prompt compiler for assembling LLM prompts.
 */
export interface PromptCompileOptions {
  /** Base persona and foundational instructions defined on the agent */
  readonly systemPrompt: string;

  /** Dynamic behavioral instructions injected by the active AgentMode strategy */
  readonly modeInstructions?: string;

  /** Key-value state variables to inject as structured system context */
  readonly contextVariables?: Readonly<Record<string, unknown>>;

  /** Full message history of the current execution thread */
  readonly history: readonly AIMessage[];
}
