/**
 * @file packages/agent/src/state/loop-detector.ts
 * @description Action repetition and infinite ping-pong detection for agent execution loops.
 *
 * ─── The Infinite Loop Problem in AI Agents (Learning note) ─────────
 * Autonomous agents can sometimes get "stuck" in a cycle:
 * For example:
 * 1. Agent calls `read_file({ path: "config.json" })` -> receives "File not found"
 * 2. Agent reasons: "Let me check config.json"
 * 3. Agent calls `read_file({ path: "config.json" })` again... endlessly burning tokens!
 *
 * The LoopDetector maintains a sliding fingerprint of recent actions.
 * If the exact same action and arguments are executed `maxRepetitions` times
 * consecutively, it flags an infinite loop error so the orchestrator can halt or intervene.
 * ───────────────────────────────────────────────────────────────────
 */

/**
 * Generates a deterministic string fingerprint for a tool call action.
 *
 * @param toolName - Name of the invoked tool.
 * @param args - Key-value arguments passed to the tool.
 * @returns Serialized fingerprint string.
 */
function createActionFingerprint(toolName: string, args: Record<string, unknown>): string {
  // Sort keys deterministically to avoid false mismatches from property order
  const sortedKeys = Object.keys(args).sort();
  const normalizedArgs: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    normalizedArgs[key] = args[key];
  }

  return `${toolName}:${JSON.stringify(normalizedArgs)}`;
}

/**
 * State container for detecting repetitive agent actions.
 */
export class LoopDetector {
  private lastFingerprint: string | null = null;
  private consecutiveCount = 0;
  private readonly maxRepetitions: number;

  /**
   * Constructs a LoopDetector.
   *
   * @param maxRepetitions - Consecutive identical actions before triggering (default: 3).
   */
  constructor(maxRepetitions = 3) {
    this.maxRepetitions = maxRepetitions;
  }

  /**
   * Records a dispatched tool action and checks whether a loop threshold has been breached.
   *
   * @param toolName - Name of the invoked tool.
   * @param args - Arguments dictionary provided to the tool.
   * @returns True if an infinite loop pattern was detected, false otherwise.
   */
  public recordAction(toolName: string, args: Record<string, unknown>): boolean {
    const fingerprint = createActionFingerprint(toolName, args);

    if (fingerprint === this.lastFingerprint) {
      this.consecutiveCount += 1;
    } else {
      this.lastFingerprint = fingerprint;
      this.consecutiveCount = 1;
    }

    return this.consecutiveCount >= this.maxRepetitions;
  }

  /**
   * Resets the loop detection state (e.g. when human operator provides intervention input).
   */
  public reset(): void {
    this.lastFingerprint = null;
    this.consecutiveCount = 0;
  }

  /**
   * Returns current consecutive repetition count.
   */
  public get repetitionCount(): number {
    return this.consecutiveCount;
  }
}
