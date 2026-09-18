/**
 * @file packages/agent/src/compiler/prompt-compiler.ts
 * @description Compiles agent definitions, mode instructions, and context into an LLM message array.
 *
 * ─── Prompt Compilation in AI Engineering (Learning note) ──────────
 * Rather than sending raw user input directly to an LLM, production agent frameworks
 * compile prompts through a layered pipeline:
 *
 * 1. Base Persona Layer: System prompt instructions (e.g. "You are an expert TypeScript engineer").
 * 2. Operating Mode Layer: Modifies strategy (e.g. "Plan mode: output numbered steps before calling tools").
 * 3. Environment State Layer: Injects active context variables (current workspace, user ID, etc.).
 * 4. Conversation History Layer: Ordered user inputs, model reasoning, tool invocations, and results.
 *
 * This pure compiler constructs the canonical `AIMessage[]` ready for adapter dispatch.
 * ───────────────────────────────────────────────────────────────────
 */

import { MessageRole } from "@orchestrai/shared-types";
import { AIMessageSchema, type AIMessage } from "@orchestrai/core";
import type { PromptCompileOptions } from "./compiler.types";

/**
 * Formats context variables into a structured XML-style context block.
 *
 * @param variables - Dictionary of context variables.
 * @returns Formatted string or empty string if no variables present.
 */
function formatContextVariables(variables?: Readonly<Record<string, unknown>>): string {
  if (!variables || Object.keys(variables).length === 0) {
    return "";
  }

  const entries = Object.entries(variables)
    .map(([key, val]) => `  <variable name="${key}">${JSON.stringify(val)}</variable>`)
    .join("\n");

  return `\n\n<execution_context>\n${entries}\n</execution_context>`;
}

/**
 * Compiles a full prompt payload into an array of AIMessage objects for the LLM.
 *
 * @param options - Prompt compilation inputs (system prompt, mode rules, context, history).
 * @returns Array of AIMessage instances with synthesized system prompt and preserved history.
 */
export function compilePrompt(options: PromptCompileOptions): AIMessage[] {
  const sections: string[] = [];

  // 1. Base Persona Prompt
  sections.push(options.systemPrompt.trim());

  // 2. Mode Strategy Instructions
  if (options.modeInstructions && options.modeInstructions.trim().length > 0) {
    sections.push(
      `\n<mode_instructions>\n${options.modeInstructions.trim()}\n</mode_instructions>`,
    );
  }

  // 3. Dynamic Context Variables
  const contextBlock = formatContextVariables(options.contextVariables);
  if (contextBlock.length > 0) {
    sections.push(contextBlock);
  }

  const consolidatedSystemPrompt = sections.join("\n");

  // Construct the synthesized system message via AIMessageSchema.parse to populate defaults
  const systemMessage: AIMessage = AIMessageSchema.parse({
    role: MessageRole.SYSTEM,
    content: consolidatedSystemPrompt,
  });

  // Combine system message with conversation history
  // If the history already begins with a system message, we replace it with our compiled one
  const filteredHistory = options.history.filter((msg) => msg.role !== MessageRole.SYSTEM);

  return [systemMessage, ...filteredHistory];
}
