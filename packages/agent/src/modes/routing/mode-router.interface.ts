/**
 * @file packages/agent/src/modes/routing/mode-router.interface.ts
 * @description Contract and context for application-controlled dynamic mode routing.
 */

import type { AgentMode } from "@orchestrai/shared-types";
import type { AIMessage } from "@orchestrai/core";
import type { ITool } from "@orchestrai/tools";

/**
 * Contextual parameters provided to a mode router to make an informed selection.
 */
export interface ModeRoutingContext {
  /** Full conversation history leading up to this turn */
  readonly messages: readonly AIMessage[];
  /** Registered tools available in the execution environment */
  readonly tools?: readonly ITool[];
  /** Currently active agent mode, if any */
  readonly currentMode?: AgentMode;
  /** Arbitrary domain or execution metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Strategy interface for selecting or transitioning the operational AgentMode.
 */
export interface IModeRouter {
  /**
   * Evaluates context and selects the most appropriate AgentMode.
   *
   * @param context - Input conversation and environment parameters.
   * @returns The resolved AgentMode enum value.
   */
  route(context: ModeRoutingContext): Promise<AgentMode> | AgentMode;
}
