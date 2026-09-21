/**
 * @file packages/tools/src/capabilities/capability-grant.schema.ts
 * @description Zod schema for scoped capability grants.
 *
 * ─── Why Scoped Grants? (Design Note) ────────────────────────────────
 * Granting FILE_READ without constraint is too broad — an agent task about
 * "reading its own config" should not be able to read /etc/hosts. Scoped
 * grants attach constraints to each capability: path prefixes for filesystem,
 * domain allowlists for network, query class allowlists for database.
 * ─────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import { Capability } from "./capability.types";

/**
 * Zod schema for a single scoped capability grant.
 * Constraints are optional — omitting them means the capability is unconstrained
 * (still bounded by the sandbox root and network allowlist at the executor level).
 */
export const CapabilityGrantSchema = z.object({
  /** The atomic capability being granted */
  capability: z.nativeEnum(Capability),

  /**
   * For FILE_READ / FILE_WRITE: restrict to this path prefix within the jail.
   * E.g. "src/" means only files under <jailRoot>/src/ may be accessed.
   */
  pathPrefix: z.string().optional(),

  /**
   * For NETWORK_OUTBOUND: restrict to these domain suffixes.
   * E.g. ["api.openai.com", ".githubusercontent.com"]
   */
  domainAllowlist: z.array(z.string()).optional(),

  /**
   * For DATABASE_READ / DATABASE_WRITE: restrict to these table names.
   * E.g. ["executions", "memory_items"]
   */
  tableAllowlist: z.array(z.string()).optional(),
});

/** Inferred TypeScript type from the Zod schema */
export type CapabilityGrant = z.infer<typeof CapabilityGrantSchema>;
