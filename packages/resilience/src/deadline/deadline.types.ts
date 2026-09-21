/**
 * Type definitions and contracts for deadlines, timeouts, and temporal budgets.
 *
 * @module @orchestrai/resilience/deadline
 */

/**
 * Options configuring bounded timeout execution.
 */
export interface TimeoutOptions {
  /** Descriptive name of the operation for contextual error reporting */
  readonly operationName?: string;
  /** Optional upstream AbortSignal to link cancellation */
  readonly signal?: AbortSignal;
  /** Custom factory to generate application-specific timeout errors */
  readonly customErrorFactory?: (operation: string, timeoutMs: number) => Error;
}

/**
 * Contract for hierarchical deadline propagation across nested task executions.
 */
export interface IDeadlineContext {
  /** Absolute epoch timestamp in milliseconds when this deadline expires */
  readonly deadlineAt: number;
  /**
   * Calculates the remaining time budget in milliseconds.
   *
   * @returns Non-negative milliseconds remaining before expiration
   */
  getRemainingMs(): number;
  /**
   * Checks whether the deadline has elapsed.
   *
   * @returns True if current time is equal to or greater than deadlineAt
   */
  isExpired(): boolean;
  /**
   * Retrieves the AbortSignal linked to this deadline context.
   *
   * @returns Active AbortSignal that aborts on expiration or manual cancellation
   */
  getSignal(): AbortSignal;
  /**
   * Spawns a child deadline context with an optional constrained time budget.
   * The child deadline will never exceed the parent deadline.
   *
   * @param childBudgetMs - Maximum milliseconds allowed for the child operation
   * @returns New nested IDeadlineContext bounded by parent and child limits
   */
  createChild(childBudgetMs?: number): IDeadlineContext;
  /**
   * Cleans up timers associated with this deadline context.
   */
  dispose(): void;
}
