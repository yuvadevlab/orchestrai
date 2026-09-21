/**
 * Controlled synthetic fault injector simulating latency spikes and transient outages.
 *
 * @module @orchestrai/resilience/chaos
 */

import type { ChaosConfig, ChaosMetrics } from "./chaos.types";

/**
 * Standard synthetic error injected during chaos simulations.
 */
export class ChaosInjectedError extends Error {
  public readonly code = "CHAOS_INJECTED_FAILURE" as const;

  public constructor(context?: string) {
    super(`Chaos injection triggered synthetic failure${context ? ` in '${context}'` : ""}`);
    this.name = "ChaosInjectedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * ChaosInjector introduces synthetic delays and probabilistic failures to validate
 * application resilience policies without incurring real production outages.
 */
export class ChaosInjector {
  private enabled: boolean;
  private failureRate: number;
  private latencyMinMs: number;
  private latencyMaxMs: number;
  private readonly errorFactory: (context?: string) => Error;

  private totalCalls = 0;
  private injectedFailures = 0;
  private injectedLatencies = 0;
  private totalInjectedDelayMs = 0;

  /**
   * Constructs a new ChaosInjector instance.
   *
   * @param config - Chaos configuration options
   */
  public constructor(config: ChaosConfig = {}) {
    this.enabled = config.enabled ?? false;
    this.failureRate = Math.min(1.0, Math.max(0.0, config.failureRate ?? 0));
    this.latencyMinMs = Math.max(0, config.latencyMinMs ?? 0);
    this.latencyMaxMs = Math.max(this.latencyMinMs, config.latencyMaxMs ?? 0);
    this.errorFactory =
      config.errorFactory ?? ((context): Error => new ChaosInjectedError(context));
  }

  /**
   * Executes a function through the chaos testing boundary, probabilistically injecting
   * latency and/or errors if chaos is enabled.
   *
   * @template T - Return type
   * @param fn - Asynchronous function to execute
   * @param context - Optional description of the operation context
   * @returns Resolved result of fn
   */
  public async execute<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    this.totalCalls++;

    // If disabled, bypass fault injection entirely
    if (!this.enabled) {
      return await fn();
    }

    // Evaluate synthetic latency injection
    if (this.latencyMaxMs > 0) {
      const delay = this.latencyMinMs + Math.random() * (this.latencyMaxMs - this.latencyMinMs);
      const roundedDelay = Math.floor(delay);

      if (roundedDelay > 0) {
        this.injectedLatencies++;
        this.totalInjectedDelayMs += roundedDelay;
        await new Promise<void>((resolve) => setTimeout(resolve, roundedDelay));
      }
    }

    // Evaluate synthetic failure injection
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      this.injectedFailures++;
      throw this.errorFactory(context);
    }

    return await fn();
  }

  /** Enables chaos fault injection */
  public enable(): void {
    this.enabled = true;
  }

  /** Disables chaos fault injection */
  public disable(): void {
    this.enabled = false;
  }

  /** Dynamically updates failure injection probability */
  public setFailureRate(rate: number): void {
    this.failureRate = Math.min(1.0, Math.max(0.0, rate));
  }

  /** Dynamically updates artificial latency boundaries */
  public setLatency(minMs: number, maxMs: number): void {
    this.latencyMinMs = Math.max(0, minMs);
    this.latencyMaxMs = Math.max(this.latencyMinMs, maxMs);
  }

  /** Retrieves operational chaos telemetry metrics */
  public getMetrics(): ChaosMetrics {
    return {
      totalCalls: this.totalCalls,
      injectedFailures: this.injectedFailures,
      injectedLatencies: this.injectedLatencies,
      totalInjectedDelayMs: this.totalInjectedDelayMs,
    };
  }
}
