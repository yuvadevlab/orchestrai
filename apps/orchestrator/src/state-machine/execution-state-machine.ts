/**
 * @file apps/orchestrator/src/state-machine/execution-state-machine.ts
 * @description Deterministic execution state machine with transition guards and audit logging.
 * Enforces zero hardcoded strings by checking strictly against canonical enum keys.
 * @module apps/orchestrator/state-machine
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import {
  OrchestratorState,
  OrchestratorEventType,
  type OrchestratorEvent,
  type StateTransitionListener,
} from "./state-machine.types";

const logger = loggerWithConfig(new Logger("ExecutionStateMachine"));

/**
 * Deterministic finite state machine tracking lifecycle phases of an execution run.
 */
export class ExecutionStateMachine {
  private currentState: OrchestratorState = OrchestratorState.PENDING;
  private readonly listeners: StateTransitionListener[] = [];
  private readonly history: Array<{
    from: OrchestratorState;
    to: OrchestratorState;
    timestamp: Date;
  }> = [];

  /**
   * Initializes the state machine with an optional initial state (defaults to PENDING).
   *
   * @param executionId - Execution UUID identifier
   * @param initialState - Starting state
   */
  constructor(
    public readonly executionId: string,
    initialState: OrchestratorState = OrchestratorState.PENDING,
  ) {
    this.currentState = initialState;
  }

  /**
   * Current active state.
   */
  public get state(): OrchestratorState {
    return this.currentState;
  }

  /**
   * Returns true if the state machine has reached an immutable terminal state.
   */
  public get isTerminal(): boolean {
    return (
      this.currentState === OrchestratorState.COMPLETED ||
      this.currentState === OrchestratorState.FAILED ||
      this.currentState === OrchestratorState.CANCELLED
    );
  }

  /**
   * Registers a transition listener.
   */
  public onTransition(listener: StateTransitionListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  /**
   * Attempts to transition the state machine to a next state triggered by an event.
   *
   * @param event - Transition event payload
   * @returns The resulting state after transition
   * @throws Error if the transition is invalid or machine is already in a terminal state
   */
  public async transition(event: OrchestratorEvent): Promise<OrchestratorState> {
    const nextState = this.determineNextState(event);

    logger.debug("transition: state transition requested", {
      executionId: this.executionId,
      from: this.currentState,
      to: nextState,
      eventType: event.type,
    });

    const previousState = this.currentState;
    this.currentState = nextState;
    this.history.push({ from: previousState, to: nextState, timestamp: new Date() });

    // Notify all registered transition listeners
    for (const listener of this.listeners) {
      await listener(previousState, nextState, event);
    }

    return this.currentState;
  }

  /**
   * Evaluates valid transitions from current state against the inbound event using strict Enum checks.
   */
  private determineNextState(event: OrchestratorEvent): OrchestratorState {
    if (this.isTerminal) {
      throw new Error(
        `Cannot transition execution ${this.executionId}: already in terminal state "${this.currentState}"`,
      );
    }

    // Global cancellation is allowed from any non-terminal state
    if (event.type === OrchestratorEventType.CANCEL) {
      return OrchestratorState.CANCELLED;
    }

    // Global failure is allowed from any non-terminal state
    if (event.type === OrchestratorEventType.FAIL) {
      return OrchestratorState.FAILED;
    }

    switch (this.currentState) {
      case OrchestratorState.PENDING:
        if (event.type === OrchestratorEventType.START) return OrchestratorState.RUNNING;
        break;

      case OrchestratorState.RUNNING:
        if (event.type === OrchestratorEventType.TOOL_START) return OrchestratorState.TOOL_CALL;
        if (event.type === OrchestratorEventType.REQUEST_APPROVAL)
          return OrchestratorState.AWAITING_APPROVAL;
        if (event.type === OrchestratorEventType.COMPLETE) return OrchestratorState.COMPLETED;
        break;

      case OrchestratorState.TOOL_CALL:
        if (event.type === OrchestratorEventType.TOOL_FINISH) return OrchestratorState.RUNNING;
        if (event.type === OrchestratorEventType.REQUEST_APPROVAL)
          return OrchestratorState.AWAITING_APPROVAL;
        break;

      case OrchestratorState.AWAITING_APPROVAL:
        if (event.type === OrchestratorEventType.RESOLVE_APPROVAL) {
          // If approved, resume running; if denied, transition to failed
          return event.payload.approved ? OrchestratorState.RUNNING : OrchestratorState.FAILED;
        }
        break;
    }

    throw new Error(
      `Invalid transition for execution ${this.executionId}: cannot apply event "${event.type}" while in state "${this.currentState}"`,
    );
  }

  /**
   * Returns a copy of the transition audit history.
   */
  public getHistory(): ReadonlyArray<{
    from: OrchestratorState;
    to: OrchestratorState;
    timestamp: Date;
  }> {
    return [...this.history];
  }
}
