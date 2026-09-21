/**
 * @file packages/events/src/ordering/vector-clock.ts
 * @description Vector clock implementation for tracking causal event ordering in distributed systems.
 */

import { ClockComparison, type VectorClockMap } from "./vector-clock.types";

/**
 * Vector clock utility for tracking event causation and detecting concurrent edits/actions.
 */
export class VectorClock {
  /**
   * Internal clock state map.
   */
  private clockMap: VectorClockMap;

  /**
   * Constructs a VectorClock instance.
   *
   * @param initialMap - Optional starting vector clock map.
   */
  constructor(initialMap: VectorClockMap = {}) {
    this.clockMap = { ...initialMap };
  }

  /**
   * Increments the clock tick for a specific node ID.
   *
   * @param nodeId - Identifier of node/agent generating event.
   * @returns Reference to this clock for chaining.
   */
  public increment(nodeId: string): this {
    const current = this.clockMap[nodeId] ?? 0;
    this.clockMap[nodeId] = current + 1;
    return this;
  }

  /**
   * Gets the logical counter value for a given node.
   *
   * @param nodeId - Node identifier.
   */
  public get(nodeId: string): number {
    return this.clockMap[nodeId] ?? 0;
  }

  /**
   * Merges this vector clock with another vector clock (element-wise maximum).
   *
   * @param other - VectorClock instance or raw map to merge into this instance.
   */
  public merge(other: VectorClock | VectorClockMap): this {
    const otherMap = other instanceof VectorClock ? other.toMap() : other;

    for (const [node, value] of Object.entries(otherMap)) {
      const current = this.clockMap[node] ?? 0;
      // Inline comment: Take the element-wise maximum across all node keys
      this.clockMap[node] = Math.max(current, value);
    }

    return this;
  }

  /**
   * Compares this vector clock with another vector clock.
   *
   * @param other - VectorClock instance to compare against.
   * @returns ClockComparison (EQUAL, BEFORE, AFTER, CONCURRENT).
   */
  public compare(other: VectorClock | VectorClockMap): ClockComparison {
    const otherMap = other instanceof VectorClock ? other.toMap() : other;
    const allNodes = new Set([...Object.keys(this.clockMap), ...Object.keys(otherMap)]);

    let isGreater = false;
    let isLesser = false;

    for (const node of allNodes) {
      const v1 = this.clockMap[node] ?? 0;
      const v2 = otherMap[node] ?? 0;

      // Inline comment: Evaluate directional inequality per node key
      if (v1 > v2) {
        isGreater = true;
      } else if (v1 < v2) {
        isLesser = true;
      }
    }

    // Guard clause: if both greater and lesser components were found, clocks are concurrent
    if (isGreater && isLesser) {
      return ClockComparison.CONCURRENT;
    }

    // Guard clause: if strictly greater, this clock came AFTER
    if (isGreater) {
      return ClockComparison.AFTER;
    }

    // Guard clause: if strictly lesser, this clock came BEFORE
    if (isLesser) {
      return ClockComparison.BEFORE;
    }

    return ClockComparison.EQUAL;
  }

  /**
   * Checks if this clock causally precedes another clock.
   */
  public causallyPrecedes(other: VectorClock | VectorClockMap): boolean {
    return this.compare(other) === ClockComparison.BEFORE;
  }

  /**
   * Checks if this clock is concurrent with another clock.
   */
  public isConcurrent(other: VectorClock | VectorClockMap): boolean {
    return this.compare(other) === ClockComparison.CONCURRENT;
  }

  /**
   * Returns a copy of the underlying vector clock map.
   */
  public toMap(): VectorClockMap {
    return { ...this.clockMap };
  }

  /**
   * Creates a VectorClock instance from a raw vector map.
   */
  public static fromMap(map: VectorClockMap): VectorClock {
    return new VectorClock(map);
  }
}
