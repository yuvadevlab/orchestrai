/**
 * @file packages/agent/src/modes/routing/heuristic-mode-router.ts
 * @description Fast, zero-latency rule-based heuristic classifier for AUTO mode routing.
 */

import { AgentMode } from "@orchestrai/shared-types";
import type { IModeRouter, ModeRoutingContext } from "./mode-router.interface";

/**
 * High-speed regex patterns for intent classification.
 */
const PLAN_PATTERNS = [
  /\b(plan|design|architect|roadmap|breakdown|strategy|steps to|how would we)\b/i,
  /\b(decompose|outline the process|prepare a plan|milestones)\b/i,
];

const ACT_PATTERNS = [
  /\b(create|build|delete|remove|deploy|execute|run|install|update|modify|refactor)\b/i,
  /\b(write to|make the changes|push|commit|checkout|apply)\b/i,
];

const CHAT_PATTERNS = [
  /\b(hi|hello|hey|greetings|thanks|thank you|who are you|what can you do)\b/i,
  /\b(explain|what is|tell me about|summarize|why does|describe|difference between)\b/i,
];

/**
 * Heuristic router classifying user intent via lexical patterns and query features.
 */
export class HeuristicModeRouter implements IModeRouter {
  private readonly defaultMode: AgentMode;

  constructor(defaultMode: AgentMode = AgentMode.ACT) {
    this.defaultMode = defaultMode;
  }

  /**
   * Evaluates the latest user message against heuristic rule sets.
   */
  public route(context: ModeRoutingContext): AgentMode {
    const latestUserMsg = [...context.messages].reverse().find((m) => m.role === "user");

    // Guard: Fallback to default if no user message found in history
    if (!latestUserMsg || typeof latestUserMsg.content !== "string") {
      return this.defaultMode;
    }

    const text = latestUserMsg.content.trim();

    // 1. Check for explicit planning cues
    const isPlan = PLAN_PATTERNS.some((pattern) => pattern.test(text));
    if (isPlan) {
      return AgentMode.PLAN;
    }

    // 2. Check for action / mutation cues
    const isAct = ACT_PATTERNS.some((pattern) => pattern.test(text));
    if (isAct) {
      return AgentMode.ACT;
    }

    // 3. Check for conversational / informational queries
    const isChat = CHAT_PATTERNS.some((pattern) => pattern.test(text));
    if (isChat) {
      return AgentMode.CHAT;
    }

    // Default: Fallback to configured operational default mode
    return this.defaultMode;
  }
}
