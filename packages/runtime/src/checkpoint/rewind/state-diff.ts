/**
 * @file packages/runtime/src/checkpoint/rewind/state-diff.ts
 * @description Deep object delta calculator comparing sequential checkpoints for time-travel inspection.
 */

/**
 * Detailed difference summary between two graph state snapshots.
 */
export interface StateDiffResult {
  /** Properties added in the current state that did not exist previously */
  readonly added: Record<string, unknown>;
  /** Properties whose values were modified between snapshots */
  readonly modified: Record<string, { readonly before: unknown; readonly after: unknown }>;
  /** Properties deleted or undefined in the current state */
  readonly deleted: Record<string, unknown>;
  /** Quick boolean indicator whether any differences were detected */
  readonly hasChanges: boolean;
}

/**
 * Checks if two arbitrary values are deeply equal using JSON representation comparison.
 */
function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Calculates granular additions, modifications, and deletions between two graph states.
 *
 * @param previous - Base snapshot state object.
 * @param current - Target snapshot state object.
 * @returns StateDiffResult breakdown.
 */
export function calculateStateDiff(previous: unknown, current: unknown): StateDiffResult {
  const added: Record<string, unknown> = {};
  const modified: Record<string, { before: unknown; after: unknown }> = {};
  const deleted: Record<string, unknown> = {};

  const prevObj = (typeof previous === "object" && previous !== null ? previous : {}) as Record<
    string,
    unknown
  >;
  const currObj = (typeof current === "object" && current !== null ? current : {}) as Record<
    string,
    unknown
  >;

  const prevKeys = new Set(Object.keys(prevObj));
  const currKeys = new Set(Object.keys(currObj));

  // 1. Detect additions and modifications in current keys
  for (const key of currKeys) {
    if (!prevKeys.has(key)) {
      // Key only exists in current state -> Added
      added[key] = currObj[key];
    } else if (!isDeepEqual(prevObj[key], currObj[key])) {
      // Key exists in both but values differ -> Modified
      modified[key] = {
        before: prevObj[key],
        after: currObj[key],
      };
    }
  }

  // 2. Detect deletions in previous keys
  for (const key of prevKeys) {
    if (!currKeys.has(key)) {
      // Key existed in previous state but absent in current -> Deleted
      deleted[key] = prevObj[key];
    }
  }

  const hasChanges =
    Object.keys(added).length > 0 ||
    Object.keys(modified).length > 0 ||
    Object.keys(deleted).length > 0;

  return { added, modified, deleted, hasChanges };
}
