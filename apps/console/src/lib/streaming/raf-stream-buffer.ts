/**
 * @file apps/console/src/lib/streaming/raf-stream-buffer.ts
 * @description 120 FPS high-performance stream buffer coalescing token deltas via requestAnimationFrame.
 * Prevents React state thrashing by scheduling updates synchronized with the browser display refresh rate.
 * @module apps/console/lib/streaming
 */

/**
 * Listener callback signature invoked with flushed text chunk deltas.
 */
export type RafFlushCallback = (accumulatedDelta: string, fullContent: string) => void;

/**
 * Smooth 60-120 FPS token stream buffer using requestAnimationFrame coalescing.
 */
export class RafStreamBuffer {
  private buffer = "";
  private fullContent = "";
  private rafId: number | null = null;
  private readonly listeners = new Set<RafFlushCallback>();
  private isDestroyed = false;

  constructor(initialContent = "") {
    this.fullContent = initialContent;
  }

  /**
   * Appends an incremental text token delta to the pending animation frame buffer.
   *
   * @param delta - Newly arrived string token fragment
   */
  public push(delta: string): void {
    if (this.isDestroyed || !delta) {
      return;
    }

    this.buffer += delta;
    this.fullContent += delta;

    // Schedule RAF flush if not already queued
    if (this.rafId === null) {
      this.scheduleFlush();
    }
  }

  /**
   * Registers a callback for receiving batched frame flushes.
   */
  public subscribe(callback: RafFlushCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Returns current accumulated full content.
   */
  public getContent(): string {
    return this.fullContent;
  }

  /**
   * Schedules a flush on the next display refresh frame (~16ms for 60Hz, ~8ms for 120Hz).
   */
  private scheduleFlush(): void {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      this.rafId = window.requestAnimationFrame(() => this.flush());
    } else {
      // Fallback for SSR or non-browser environments
      this.rafId = setTimeout(() => this.flush(), 16) as unknown as number;
    }
  }

  /**
   * Flushes all buffered deltas to registered listeners.
   */
  public flush(): void {
    this.rafId = null;
    if (this.buffer.length === 0) {
      return;
    }

    const currentDelta = this.buffer;
    this.buffer = "";

    this.listeners.forEach((listener) => {
      try {
        listener(currentDelta, this.fullContent);
      } catch {
        // Prevent unhandled listener exceptions from crashing the animation frame loop
      }
    });
  }

  /**
   * Resets internal buffer state.
   */
  public reset(newContent = ""): void {
    if (this.rafId !== null) {
      if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(this.rafId);
      } else {
        clearTimeout(this.rafId);
      }
      this.rafId = null;
    }
    this.buffer = "";
    this.fullContent = newContent;
  }

  /**
   * Destroys the buffer and releases queued timers.
   */
  public destroy(): void {
    this.reset();
    this.listeners.clear();
    this.isDestroyed = true;
  }
}
