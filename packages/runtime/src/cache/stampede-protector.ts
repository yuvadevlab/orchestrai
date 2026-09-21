/**
 * @file stampede-protector.ts
 * @description Single-flight request coalescer preventing cache stampedes under high concurrency.
 * @module @orchestrai/runtime/cache
 */

/**
 * Coalesces duplicate concurrent requests for the same resource key into a single execution.
 */
export class StampedeProtector {
  private readonly activeRequests = new Map<string, Promise<unknown>>();

  /**
   * Executes factory function for a key, coalescing concurrent calls onto the same active promise.
   *
   * @param key - Resource key identifier.
   * @param compute - Factory function producing resource value.
   * @returns Resolved resource value.
   */
  public async executeSingleFlight<T>(key: string, compute: () => Promise<T>): Promise<T> {
    const active = this.activeRequests.get(key);

    // Coalesce branch: Return in-flight promise if identical key computation is active
    if (active) {
      return active as Promise<T>;
    }

    // Single-flight execution
    const promise = compute().finally(() => {
      // Guaranteed cleanup: Purge in-flight key when promise completes
      this.activeRequests.delete(key);
    });

    this.activeRequests.set(key, promise);
    return promise;
  }

  /**
   * Returns active in-flight request count.
   */
  public get pendingCount(): number {
    return this.activeRequests.size;
  }
}
