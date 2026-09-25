/**
 * @file packages/prompts/src/templates/prompt-builder.ts
 * @description Type-safe prompt builder combining personas, active tools, and workspace context.
 * @module @orchestrai/prompts/templates
 */

import { AUTONOMOUS_TOOLS_SYSTEM_PROMPT } from "../system/autonomous-tools.prompt";
import { STRUCTURED_PLANNING_SYSTEM_PROMPT } from "../system/planning.prompt";
import { SAFETY_GUARDRAILS_SYSTEM_PROMPT } from "../system/safety.prompt";
import { SPECIALIST_PERSONA_REGISTRY } from "../personas";

/**
 * Options for constructing a composite system prompt.
 */
export interface SystemPromptBuilderOptions {
  /** Persona identifier (e.g. 'developer', 'architect') or custom persona prompt string */
  readonly persona?: string;
  /** Custom task instructions or contextual rules */
  readonly customGuidelines?: string;
  /** Whether to inject autonomous tool invocation schemas */
  readonly enableTools?: boolean;
  /** Whether to inject structured planning directives */
  readonly enablePlanning?: boolean;
  /** Whether to inject safety invariants */
  readonly enableSafety?: boolean;
}

/**
 * Builds a composite system prompt by combining persona instructions, tools, and safety constraints.
 *
 * @param options - Prompt composition configuration.
 * @returns Fully formatted system prompt string.
 */
export function buildSystemPrompt(options: SystemPromptBuilderOptions = {}): string {
  const sections: string[] = [];

  // 1. Resolve Persona Prompt
  if (options.persona && options.persona.trim().length > 0) {
    const key = options.persona.toLowerCase().trim();
    const resolvedPersona = SPECIALIST_PERSONA_REGISTRY[key] || options.persona.trim();
    sections.push(resolvedPersona);
  }

  // 2. Custom Guidelines
  if (options.customGuidelines && options.customGuidelines.trim().length > 0) {
    sections.push(options.customGuidelines.trim());
  }

  // 3. Structured Planning Directives
  if (options.enablePlanning) {
    sections.push(STRUCTURED_PLANNING_SYSTEM_PROMPT);
  }

  // 4. Autonomous Tool Instructions
  if (options.enableTools ?? true) {
    sections.push(AUTONOMOUS_TOOLS_SYSTEM_PROMPT);
  }

  // 5. Safety Invariants
  if (options.enableSafety) {
    sections.push(SAFETY_GUARDRAILS_SYSTEM_PROMPT);
  }

  return sections.join("\n\n").trim();
}

/**
 * Legacy compatibility helper: combines optional persona prompt with autonomous tool instructions.
 *
 * @param personaPrompt - Optional persona prompt text.
 * @returns Combined system prompt with autonomous tools enabled.
 */
export function buildAutonomousSystemPrompt(personaPrompt?: string): string {
  return buildSystemPrompt({
    persona: personaPrompt,
    enableTools: true,
  });
}
