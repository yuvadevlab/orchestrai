/**
 * @file packages/agent/src/modes/controller/mode-controller.ts
 * @description Manages active agent mode, lifecycle transitions, and transition audit history.
 */

import { AgentMode } from "@orchestrai/shared-types";
import type { IModeRouter } from "../routing/mode-router.interface";

/**
 * Record of a discrete mode transition during an agent execution lifecycle.
 */
export interface ModeTransitionRecord {
  readonly from: AgentMode;
  readonly to: AgentMode;
  readonly reason?: string;
  readonly timestamp: Date;
}

export type ModeTransitionListener = (transition: ModeTransitionRecord) => void;

/**
 * Options configuring the ModeController.
 */
export interface ModeControllerOptions {
  readonly initialMode?: AgentMode;
  readonly router?: IModeRouter;
}

/**
 * Stateful controller managing operational mode transitions and lifecycle progression.
 */
export class ModeController {
  private activeMode: AgentMode;
  private readonly router?: IModeRouter;
  private readonly history: ModeTransitionRecord[] = [];
  private readonly listeners: Set<ModeTransitionListener> = new Set();

  constructor(options?: ModeControllerOptions) {
    this.activeMode = options?.initialMode ?? AgentMode.AUTO;
    this.router = options?.router;
  }

  /**
   * Retrieves the current operational AgentMode.
   */
  public getMode(): AgentMode {
    return this.activeMode;
  }

  /**
   * Returns a copy of the mode transition history.
   */
  public getHistory(): readonly ModeTransitionRecord[] {
    return [...this.history];
  }

  /**
   * Transitions the active mode to a new AgentMode, notifying registered listeners.
   *
   * @param targetMode - The new AgentMode to transition to.
   * @param reason - Contextual rationale for the transition.
   * @returns True if the mode changed, false if already in targetMode.
   */
  public transitionTo(targetMode: AgentMode, reason?: string): boolean {
    // Guard: Skip transition if already in target mode
    if (this.activeMode === targetMode) {
      return false;
    }

    const record: ModeTransitionRecord = {
      from: this.activeMode,
      to: targetMode,
      reason,
      timestamp: new Date(),
    };

    this.activeMode = targetMode;
    this.history.push(record);

    // Notify listeners
    for (const listener of this.listeners) {
      listener(record);
    }

    return true;
  }

  /**
   * Registers a callback listener invoked on every mode transition.
   *
   * @param listener - Function receiving ModeTransitionRecord.
   * @returns Unsubscribe cleanup function.
   */
  public onTransition(listener: ModeTransitionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Optional router configured for application-controlled dynamic routing.
   */
  public getRouter(): IModeRouter | undefined {
    return this.router;
  }
}
