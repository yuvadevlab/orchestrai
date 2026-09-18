/**
 * @file packages/core/src/tools/tool-definition.schema.ts
 * @description Canonical declaration format for tools registered with the platform.
 */

import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import { ToolPermissionLevelSchema } from "./tool-permissions.schema";

/**
 * Standard tool definition schema providing runtime validation and LLM parameter specification.
 */
export const ToolDefinitionSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message: "Tool name must contain only alphanumeric characters, underscores, and dashes",
      })
      .describe("Unique tool identifier string"),
    description: z
      .string()
      .min(1)
      .max(1024)
      .describe("Clear semantic description consumed by the LLM"),
    permissionLevel: ToolPermissionLevelSchema.default(ToolPermissionLevel.READ_ONLY),
    parametersSchema: z
      .record(z.string(), z.unknown())
      .describe("JSON Schema compliant specification of expected tool input parameters"),
    timeoutMs: z
      .number()
      .int()
      .positive()
      .default(30_000)
      .describe("Maximum allowed tool runtime in milliseconds"),
    isDestructive: z
      .boolean()
      .default(false)
      .describe("Explicit indicator of irreversible modifications"),
  })
  .describe("Complete registration specification for an executable tool");

export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
