/**
 * @file packages/agent/src/state/agent-state-machine.ts
 * @description State transition controller and invariant protector for active agent executions.
 *
 * ─── Managing Agent State (Learning note for AI Engineers) ─────────
 * As an agent progresses through its reasoning loop:
 * - Step counters increment
 * - Context variables (variables extracted by tools or user input) mutate
 * - Human-in-the-loop approval blocks can occur
 * - Termination conditions (max steps or explicit exit) can be reached
 *
 * `AgentStateMachine` wraps the canonical `AgentState` schema, providing
 * guarded mutators that guarantee invariant compliance at every step.
 * ───────────────────────────────────────────────────────────────────
 */

import { OrchestrAIError } from "@orchestrai/core";
import type { AgentState } from "@orchestrai/core";
import { LoopDetector } from "./loop-detector";

/**
 * State machine managing the dynamic lifecycle and step execution of an active agent.
 */
export class AgentStateMachine {
  private readonly state: AgentState;
  private readonly loopDetector: LoopDetector;

  /**
   * Constructs a state machine wrapping an initial AgentState.
   *
   * @param initialState - Validated AgentState record.
   * @param maxLoopRepetitions - Maximum consecutive identical actions before loop termination.
   */
  constructor(initialState: AgentState, maxLoopRepetitions = 3) {
    this.state = {
      ...initialState,
      contextVariables: { ...initialState.contextVariables },
    };
    this.loopDetector = new LoopDetector(maxLoopRepetitions);
  }

  /**
   * Increments the current execution step index, guarding against step exhaustion.
   *
   * @returns The updated step index.
   * @throws {OrchestrAIError} with code VALIDATION_ERROR if maxSteps is exceeded.
   */
  public advanceStep(): number {
    if (this.state.isTerminated) {
      throw new OrchestrAIError(
        `Cannot advance step: agent execution "${this.state.executionId}" is already terminated`,
        "VALIDATION_ERROR",
        400,
        { executionId: this.state.executionId },
      );
    }

    if (this.state.currentStepIndex >= this.state.maxSteps) {
      this.state.isTerminated = true;
      throw new OrchestrAIError(
        `Execution step limit reached: exceeded maximum ${this.state.maxSteps} allowed steps`,
        "VALIDATION_ERROR",
        400,
        {
          executionId: this.state.executionId,
          currentStepIndex: this.state.currentStepIndex,
          maxSteps: this.state.maxSteps,
        },
      );
    }

    this.state.currentStepIndex += 1;
    return this.state.currentStepIndex;
  }

  /**
   * Records a tool call action and updates loop detection state.
   *
   * @param toolName - Name of the invoked tool.
   * @param args - Arguments dictionary provided to the tool.
   * @returns True if an infinite loop was detected.
   */
  public recordAction(toolName: string, args: Record<string, unknown>): boolean {
    const isLoop = this.loopDetector.recordAction(toolName, args);
    this.state.loopCount = this.loopDetector.repetitionCount;

    if (isLoop) {
      this.state.isTerminated = true;
    }

    return isLoop;
  }

  /**
   * Sets or updates an ephemeral context variable.
   *
   * @param key - Variable identifier name.
   * @param value - Serializable value payload.
   * @returns This state machine instance for chaining.
   */
  public setContextVariable(key: string, value: unknown): this {
    this.state.contextVariables[key] = value;
    return this;
  }

  /**
   * Retrieves an ephemeral context variable by key.
   *
   * @param key - Variable identifier name.
   * @returns The stored value, or undefined if absent.
   */
  public getContextVariable<T = unknown>(key: string): T | undefined {
    return this.state.contextVariables[key] as T | undefined;
  }

  /**
   * Suspends execution with an active Human-in-the-Loop approval request ID.
   *
   * @param approvalId - UUID of the pending approval request.
   */
  public setPendingApproval(approvalId: string): void {
    this.state.pendingApprovalId = approvalId;
  }

  /**
   * Clears the active approval lock upon human operator resolution.
   */
  public clearPendingApproval(): void {
    this.state.pendingApprovalId = undefined;
    this.loopDetector.reset();
  }

  /**
   * Marks the agent execution as terminated.
   */
  public terminate(): void {
    this.state.isTerminated = true;
  }

  /**
   * Returns a deep clone snapshot of the current state.
   */
  public snapshot(): Readonly<AgentState> {
    return {
      ...this.state,
      contextVariables: { ...this.state.contextVariables },
    };
  }

  /** Whether the agent loop is halted */
  public get isTerminated(): boolean {
    return this.state.isTerminated;
  }

  /** Whether the agent is paused waiting for human approval */
  public get isWaitingForApproval(): boolean {
    return this.state.pendingApprovalId !== undefined;
  }
}
