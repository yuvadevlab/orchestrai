/**
 * @file packages/core/src/tools/tool-permissions.schema.ts
 * @description Permission tiers and human approval thresholds for tool invocations.
 */

import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";

/**
 * Hierarchical permission classification for executable tools backed by ToolPermissionLevel enum.
 */
export const ToolPermissionLevelSchema = z
  .nativeEnum(ToolPermissionLevel)
  .describe("Risk classification tier governing execution clearance");

/**
 * Determines whether a tool permission level mandates explicit human operator clearance.
 *
 * @param level - The tool's declared permission tier.
 * @returns True if human approval must interrupt execution before invocation.
 */
export function requiresHumanApproval(level: ToolPermissionLevel): boolean {
  // DANGEROUS actions unconditionally require human signoff
  return level === ToolPermissionLevel.DANGEROUS;
}
