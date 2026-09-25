/**
 * @file packages/prompts/src/personas/index.ts
 * @description Barrel export for specialist persona prompt constants and registry.
 * @module @orchestrai/prompts/personas
 */

export * from "./developer.prompt";
export * from "./architect.prompt";
export * from "./researcher.prompt";
export * from "./orchestrator.prompt";

import { DEVELOPER_PERSONA_PROMPT } from "./developer.prompt";
import { ARCHITECT_PERSONA_PROMPT } from "./architect.prompt";
import { RESEARCHER_PERSONA_PROMPT } from "./researcher.prompt";
import { ORCHESTRATOR_PERSONA_PROMPT } from "./orchestrator.prompt";

/**
 * Standard registry mapping specialist persona identifiers to prompt constants.
 */
export const SPECIALIST_PERSONA_REGISTRY: Record<string, string> = {
  developer: DEVELOPER_PERSONA_PROMPT,
  architect: ARCHITECT_PERSONA_PROMPT,
  researcher: RESEARCHER_PERSONA_PROMPT,
  orchestrator: ORCHESTRATOR_PERSONA_PROMPT,
};
