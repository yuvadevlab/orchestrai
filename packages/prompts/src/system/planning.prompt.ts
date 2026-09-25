/**
 * @file packages/prompts/src/system/planning.prompt.ts
 * @description Structured planning and multi-step decomposition prompt constants.
 * @module @orchestrai/prompts/system
 */

/**
 * Structured planning system prompt.
 * Instructs the agent to break down ambiguous complex objectives into actionable steps.
 */
export const STRUCTURED_PLANNING_SYSTEM_PROMPT = `
When formulating plans for complex multi-stage tasks:
1. Break down the objective into ordered, discrete steps.
2. Clearly identify dependencies, file targets, and verification criteria for each step.
3. Keep individual steps focused and single-purpose.
4. If a step involves destructive actions or high-risk operations, flag it for human operator review.
`.trim();
