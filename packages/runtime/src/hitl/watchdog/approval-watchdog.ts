/**
 * @file packages/runtime/src/hitl/watchdog/approval-watchdog.ts
 * @description Background watchdog sweeper detecting expired approval tickets and preventing zombie executions.
 */

import type { IApprovalStorage } from "../contracts";

/**
 * Background timer sweeper that continuously checks for expired approval tickets.
 */
export class ApprovalWatchdog {
  private readonly storage: IApprovalStorage;
  private readonly intervalMs: number;
  private timer: NodeJS.Timeout | null = null;
  private isSweeping = false;
  private running = false;

  public constructor(storage: IApprovalStorage, intervalMs = 10_000) {
    this.storage = storage;
    this.intervalMs = intervalMs;
  }

  /**
   * Performs a single sweep across storage to transition expired pending tickets to TIMED_OUT.
   *
   * @param now - Optional reference date.
   * @returns Number of tickets transitioned to TIMED_OUT during this sweep.
   */
  public async sweepOnce(now = new Date()): Promise<number> {
    // Guard: Prevent overlapping sweeps if previous query is still running
    if (this.isSweeping) {
      return 0;
    }

    this.isSweeping = true;
    try {
      return await this.storage.expireStaleTickets(now);
    } finally {
      this.isSweeping = false;
    }
  }

  /**
   * Starts the background interval watchdog.
   */
  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.timer = setInterval(() => {
      void this.sweepOnce().catch(() => {
        // Suppress unhandled exceptions during background tick
      });
    }, this.intervalMs);
  }

  /**
   * Stops the background watchdog sweeper.
   */
  public async stop(): Promise<void> {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // Await any currently in-flight sweep to complete cleanly
    while (this.isSweeping) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Returns whether the watchdog sweeper is actively running.
   */
  public isRunning(): boolean {
    return this.running;
  }
}
