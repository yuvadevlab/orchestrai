/**
 * @file packages/prompts/src/system/modes.prompt.ts
 * @description Centralized, canonical system prompt instructions for all AgentMode strategies.
 * @module @orchestrai/prompts/system
 */

import { AgentMode } from "@orchestrai/shared-types";

/**
 * System guidance for conversational CHAT mode.
 * Directs the LLM to prioritize dialogue and conversational clarity.
 */
export const CHAT_MODE_SYSTEM_PROMPT = `
Operating Mode: CHAT.
Focus on direct, helpful, conversational responses.
Only invoke tools if the user explicitly requests an action, search, or data inspection.
`.trim();

/**
 * System guidance for analytical PLAN mode.
 * Directs the LLM to break down complex tasks into structured, verifiable milestones.
 */
export const PLAN_MODE_SYSTEM_PROMPT = `
Operating Mode: PLAN.
Analyze the user's objective and deconstruct it into a logical, numbered plan of execution.
Use read-only exploration tools to investigate context if necessary, but do NOT execute
destructive modifications yet. Focus on architecture, verification criteria, and clear steps.
When ready, format your plan in a structured \`\`\`json block with keys: planId, goal,
and steps (array of { id, title, description, toolTarget, dependencies, verificationCriteria }).
`.trim();

/**
 * System guidance for autonomous action-focused ACT mode.
 * Directs the LLM to focus on sequential tool execution with minimal banter.
 */
export const ACT_MODE_SYSTEM_PROMPT = `
Operating Mode: ACT.
You are an autonomous action engine. Prioritize direct tool execution over conversational explanation.
Perform the necessary operations sequentially and conclude when the goal is achieved.
`.trim();

/**
 * System guidance for adaptive AUTO mode.
 * Directs the LLM to assess task complexity dynamically and balance planning with action.
 */
export const AUTO_MODE_SYSTEM_PROMPT = `
Operating Mode: AUTO.
You are an adaptive orchestrator. Assess task complexity dynamically.
For complex multi-step workflows, briefly state your intended approach,
then execute tools methodically, verify results, and conclude with a concise summary.
`.trim();

/**
 * Canonical registry mapping AgentMode enum keys to their respective system prompt instructions.
 */
export const MODE_PROMPT_REGISTRY: Readonly<Record<AgentMode, string>> = {
  [AgentMode.CHAT]: CHAT_MODE_SYSTEM_PROMPT,
  [AgentMode.PLAN]: PLAN_MODE_SYSTEM_PROMPT,
  [AgentMode.ACT]: ACT_MODE_SYSTEM_PROMPT,
  [AgentMode.AUTO]: AUTO_MODE_SYSTEM_PROMPT,
};
