/**
 * @file packages/memory/src/contracts/memory-type.schema.ts
 * @description Zod validation schema for canonical MemoryType enum.
 */

import { z } from "zod";
import { MemoryType } from "@orchestrai/shared-types";

/**
 * Zod schema validating a supported categorical memory type.
 */
export const MemoryTypeSchema = z
  .nativeEnum(MemoryType)
  .describe("Categorical classification of memory items dictating retention and retrieval rules");

/**
 * Re-export canonical MemoryType for consumer convenience.
 */
export { MemoryType };
