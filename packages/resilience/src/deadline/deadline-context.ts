/**
 * Hierarchical deadline propagation context managing remaining time budgets across nested tasks.
 *
 * @module @orchestrai/resilience/deadline
 */

import type { IDeadlineContext } from "./deadline.types";

/**
 * Concrete implementation of IDeadlineContext supporting parent-child budget inheritance.
 */
export class DeadlineContext implements IDeadlineContext {
  public readonly deadlineAt: number;
  private readonly controller: AbortController;
  private timerId: ReturnType<typeof setTimeout> | undefined;
  private isDisposed = false;

  /**
   * Constructs a new DeadlineContext.
   *
   * @param deadlineAt - Epoch millisecond timestamp of expiration
   * @param upstreamSignal - Optional parent signal to cascade cancellation
   */
  public constructor(deadlineAt: number, upstreamSignal?: AbortSignal) {
    this.deadlineAt = deadlineAt;
    this.controller = new AbortController();

    const remaining = this.getRemainingMs();
    if (remaining <= 0) {
      // Immediately abort if already expired upon instantiation
      this.controller.abort(new Error("Deadline already expired upon instantiation"));
    } else {
      // Schedule timer for expiration
      this.timerId = setTimeout(() => {
        if (!this.isDisposed) {
          this.controller.abort(new Error("Execution deadline expired"));
        }
      }, remaining);
    }

    // Link upstream cancellation if provided
    if (upstreamSignal) {
      if (upstreamSignal.aborted) {
        this.controller.abort(upstreamSignal.reason);
      } else {
        upstreamSignal.addEventListener(
          "abort",
          () => {
            this.controller.abort(upstreamSignal.reason);
          },
          { once: true },
        );
      }
    }
  }

  /**
   * Factory method to create a DeadlineContext with a specified duration from now.
   *
   * @param durationMs - Time budget in milliseconds
   * @param upstreamSignal - Optional parent signal
   * @returns Newly initialized DeadlineContext
   */
  public static fromDuration(durationMs: number, upstreamSignal?: AbortSignal): DeadlineContext {
    const deadlineAt = Date.now() + Math.max(0, durationMs);
    return new DeadlineContext(deadlineAt, upstreamSignal);
  }

  /**
   * Calculates remaining milliseconds before expiration.
   *
   * @returns Non-negative remaining milliseconds
   */
  public getRemainingMs(): number {
    const remaining = this.deadlineAt - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Checks if deadline has expired.
   *
   * @returns True if current timestamp is at or past deadline
   */
  public isExpired(): boolean {
    return Date.now() >= this.deadlineAt;
  }

  /**
   * Retrieves the AbortSignal linked to this deadline.
   *
   * @returns AbortSignal instance
   */
  public getSignal(): AbortSignal {
    return this.controller.signal;
  }

  /**
   * Creates a constrained child deadline context that expires no later than the parent.
   *
   * @param childBudgetMs - Optional child budget limit
   * @returns Child deadline bounded by min(parentDeadline, now + childBudget)
   */
  public createChild(childBudgetMs?: number): IDeadlineContext {
    let effectiveDeadline = this.deadlineAt;

    if (childBudgetMs !== undefined && childBudgetMs > 0) {
      const prospectiveChildDeadline = Date.now() + childBudgetMs;
      // Invariant: child deadline can never extend past parent deadline
      effectiveDeadline = Math.min(this.deadlineAt, prospectiveChildDeadline);
    }

    return new DeadlineContext(effectiveDeadline, this.getSignal());
  }

  /**
   * Disposes timer resources and disconnects listeners.
   */
  public dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
  }
}
