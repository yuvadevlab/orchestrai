/**
 * @file packages/queue/src/resilience/backpressure-controller.ts
 * @description Backpressure sensing controller protecting worker clusters from memory saturation.
 */

import { QueueBackpressureError, ValidationError } from "@orchestrai/core";
import type { QueueMetrics } from "@/types/queue.types";

/**
 * Health states determined by queue backlog evaluation.
 */
export enum BackpressureStatus {
  /** Queue depths are within safe operational limits */
  HEALTHY = "HEALTHY",
  /** Queue backlog has crossed low watermark; incoming tasks should be throttled */
  THROTTLED = "THROTTLED",
  /** Queue backlog has crossed high watermark; new non-critical tasks must be rejected */
  SATURATED = "SATURATED",
}

/**
 * Threshold configuration for backpressure evaluation.
 */
export interface BackpressureThresholds {
  /** Number of pending/waiting jobs triggering throttling (default: 500) */
  readonly lowWatermark?: number;

  /** Number of pending/waiting jobs triggering task rejection (default: 2,000) */
  readonly highWatermark?: number;

  /** Recommended throttling delay in milliseconds when state is THROTTLED (default: 2,500ms) */
  readonly throttleDelayMs?: number;
}

/**
 * Controller that evaluates queue load and signals backpressure throttle or rejection.
 */
export class BackpressureController {
  private readonly lowWatermark: number;
  private readonly highWatermark: number;
  private readonly throttleDelayMs: number;

  public constructor(thresholds: BackpressureThresholds = {}) {
    this.lowWatermark = thresholds.lowWatermark ?? 500;
    this.highWatermark = thresholds.highWatermark ?? 2_000;
    this.throttleDelayMs = thresholds.throttleDelayMs ?? 2_500;

    // Validate that high watermark strictly exceeds low watermark
    if (this.highWatermark <= this.lowWatermark) {
      throw new ValidationError(
        `Invalid backpressure config: highWatermark (${this.highWatermark}) must be greater than lowWatermark (${this.lowWatermark})`,
        { highWatermark: this.highWatermark, lowWatermark: this.lowWatermark },
      );
    }
  }

  /**
   * Assesses current queue metrics against backpressure watermarks.
   *
   * @param metrics - Current snapshot of queue waiting and active counts.
   * @returns Current backpressure evaluation verdict.
   */
  public evaluate(metrics: QueueMetrics): {
    status: BackpressureStatus;
    canAccept: boolean;
    recommendedDelayMs: number;
    backlogTotal: number;
  } {
    const backlogTotal = metrics.waiting + metrics.delayed;

    // If total backlog exceeds the high watermark, reject incoming tasks
    if (backlogTotal >= this.highWatermark) {
      return {
        status: BackpressureStatus.SATURATED,
        canAccept: false,
        recommendedDelayMs: 0,
        backlogTotal,
      };
    }

    // If total backlog crosses the low watermark, accept but apply throttling delay
    if (backlogTotal >= this.lowWatermark) {
      return {
        status: BackpressureStatus.THROTTLED,
        canAccept: true,
        recommendedDelayMs: this.throttleDelayMs,
        backlogTotal,
      };
    }

    // Healthy operating conditions: accept immediately with 0 delay
    return {
      status: BackpressureStatus.HEALTHY,
      canAccept: true,
      recommendedDelayMs: 0,
      backlogTotal,
    };
  }

  /**
   * Asserts that the queue is not saturated, throwing QueueBackpressureError if overloaded.
   *
   * @param queueName - Target queue identifier.
   * @param metrics - Current snapshot of queue metrics.
   * @throws {QueueBackpressureError} If queue backlog exceeds the high watermark.
   */
  public assertAcceptable(queueName: string, metrics: QueueMetrics): void {
    const evaluation = this.evaluate(metrics);
    if (!evaluation.canAccept) {
      throw new QueueBackpressureError(queueName, evaluation.backlogTotal, this.highWatermark);
    }
  }
}
