/**
 * @file packages/agent/src/modes/routing/heuristic-mode-router.ts
 * @description Fast, zero-latency rule-based heuristic classifier for AUTO mode routing.
 */

import { AgentMode, MessageRole } from "@orchestrai/shared-types";
import { PLAN_PATTERNS, ACT_PATTERNS, CHAT_PATTERNS } from "@orchestrai/regex";
import type { IModeRouter, ModeRoutingContext } from "./mode-router.interface";

/**
 * Heuristic router classifying user intent via lexical patterns and query features.
 */
export class HeuristicModeRouter implements IModeRouter {
  private readonly defaultMode: AgentMode;

  constructor(defaultMode: AgentMode = AgentMode.ACT) {
    this.defaultMode = defaultMode;
  }

  /**
   * Static helper to detect the appropriate AgentMode directly from text.
   *
   * @param text - Raw prompt or instruction string.
   * @param fallback - Default mode to return if no pattern matches.
   * @returns Detected AgentMode (PLAN, ACT, CHAT, or fallback).
   */
  public static detectMode(text: string, fallback: AgentMode = AgentMode.ACT): AgentMode {
    const trimmed = text.trim();
    if (!trimmed) {
      return fallback;
    }

    // 1. Check for explicit planning cues
    if (PLAN_PATTERNS.some((pattern) => pattern.test(trimmed))) {
      return AgentMode.PLAN;
    }

    // 2. Check for action / mutation cues
    if (ACT_PATTERNS.some((pattern) => pattern.test(trimmed))) {
      return AgentMode.ACT;
    }

    // 3. Check for conversational / informational queries
    if (CHAT_PATTERNS.some((pattern) => pattern.test(trimmed))) {
      return AgentMode.CHAT;
    }

    return fallback;
  }

  /**
   * Evaluates the latest user message against heuristic rule sets.
   *
   * @param context - Routing context with message history and environment.
   * @returns Resolved AgentMode.
   */
  public route(context: ModeRoutingContext): AgentMode {
    // Find last message from the user role to determine routing intent
    const latestUserMsg = [...context.messages].reverse().find((m) => m.role === MessageRole.USER);

    // Guard: Fallback to default if no user message found in history
    if (!latestUserMsg || typeof latestUserMsg.content !== "string") {
      return this.defaultMode;
    }

    return HeuristicModeRouter.detectMode(latestUserMsg.content, this.defaultMode);
  }
}

/**
 * Functional convenience helper for detecting mode from prompt text.
 *
 * @param prompt - User prompt text.
 * @param defaultMode - Fallback mode if no pattern matches (defaults to ACT).
 * @returns Detected AgentMode.
 */
export function autoDetectMode(prompt: string, defaultMode: AgentMode = AgentMode.ACT): AgentMode {
  return HeuristicModeRouter.detectMode(prompt, defaultMode);
}
