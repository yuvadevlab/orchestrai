/**
 * @file packages/tools/src/capabilities/capability.types.ts
 * @description Capability enumeration and set type for the OrchestrAI capability-based security model.
 *
 * ─── Why Capabilities? (Design Note) ────────────────────────────────
 * Traditional permission models ask "what role does this agent have?".
 * Capability-based security asks "what specific operations is this agent
 * explicitly granted?". This prevents privilege escalation — an agent that
 * needs FILE_READ for its task cannot accidentally invoke FILE_WRITE even
 * if the role-based system would technically allow it.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Atomic operation capabilities that can be granted to an agent.
 * Each capability maps to a specific class of side-effects.
 */
export enum Capability {
  /** Read files within the path jail (no writes) */
  FILE_READ = "FILE_READ",
  /** Create or overwrite files within the path jail */
  FILE_WRITE = "FILE_WRITE",
  /** Make outbound HTTP/HTTPS requests to allowlisted domains */
  NETWORK_OUTBOUND = "NETWORK_OUTBOUND",
  /** Spawn shell subprocesses — always triggers HITL */
  SHELL_EXEC = "SHELL_EXEC",
  /** Read from the agent's memory store */
  MEMORY_READ = "MEMORY_READ",
  /** Write or update the agent's memory store */
  MEMORY_WRITE = "MEMORY_WRITE",
  /** Issue SELECT queries to the database */
  DATABASE_READ = "DATABASE_READ",
  /** Issue INSERT/UPDATE/DELETE queries to the database */
  DATABASE_WRITE = "DATABASE_WRITE",
}

/**
 * An immutable set of capabilities granted to an agent for a specific execution.
 * Use a `ReadonlySet` so granted capabilities cannot be mutated after construction.
 */
export type CapabilitySet = ReadonlySet<Capability>;
