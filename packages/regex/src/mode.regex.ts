/**
 * @file packages/regex/src/mode.regex.ts
 * @description Lexical regular expression patterns for dynamic agent mode intent classification.
 * @module @orchestrai/regex
 */

/**
 * Patterns matching planning, architectural decomposition, and strategy formulation intent.
 */
export const PLAN_PATTERNS: readonly RegExp[] = [
  /\b(plan|design|architect|roadmap|breakdown|strategy|steps to|how would we)\b/i,
  /\b(decompose|outline the process|prepare a plan|milestones)\b/i,
];

/**
 * Patterns matching action, tool execution, filesystem mutations, and direct code changes.
 */
export const ACT_PATTERNS: readonly RegExp[] = [
  /\b(create|build|delete|remove|deploy|execute|run|install|update|modify|refactor)\b/i,
  /\b(write to|make the changes|push|commit|checkout|apply)\b/i,
];

/**
 * Patterns matching conversational greetings, summaries, explanations, and direct Q&A.
 */
export const CHAT_PATTERNS: readonly RegExp[] = [
  /\b(hi|hello|hey|greetings|thanks|thank you|who are you|what can you do)\b/i,
  /\b(explain|what is|tell me about|summarize|why does|describe|difference between)\b/i,
];
