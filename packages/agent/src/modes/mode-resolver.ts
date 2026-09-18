/**
 * @file packages/agent/src/modes/mode-resolver.ts
 * @description Factory function resolving the appropriate IModeStrategy for an AgentMode.
 */

import { AgentMode } from "@orchestrai/shared-types";
import type { IModeStrategy } from "./mode-strategy.interface";
import { ChatModeStrategy } from "./chat-mode.strategy";
import { PlanModeStrategy } from "./plan-mode.strategy";
import { ActModeStrategy } from "./act-mode.strategy";
import { AutoModeStrategy } from "./auto-mode.strategy";

const STRATEGY_REGISTRY: Readonly<Record<AgentMode, () => IModeStrategy>> = {
  [AgentMode.CHAT]: () => new ChatModeStrategy(),
  [AgentMode.PLAN]: () => new PlanModeStrategy(),
  [AgentMode.ACT]: () => new ActModeStrategy(),
  [AgentMode.AUTO]: () => new AutoModeStrategy(),
};

/**
 * Resolves the operational mode strategy instance for a given AgentMode.
 *
 * @param mode - The declared AgentMode enum value.
 * @returns An initialized IModeStrategy instance.
 */
export function resolveModeStrategy(mode: AgentMode): IModeStrategy {
  const factory = STRATEGY_REGISTRY[mode];
  if (!factory) {
    // Default fallback to AUTO
    return new AutoModeStrategy();
  }
  return factory();
}
