/**
 * @file packages/core/src/streaming/stream-chunk.schema.ts
 * @description Realtime execution rail chunk schemas emitted over SSE and WebSockets.
 */

import { z } from "zod";
import { StreamChunkType } from "@orchestrai/shared-types";
import { ExecutionIdSchema } from "@/identifiers";

/**
 * Functional discriminator for realtime streaming chunks backed by StreamChunkType enum.
 */
export const StreamChunkTypeSchema = z
  .nativeEnum(StreamChunkType)
  .describe("Category of delta payload contained in this stream chunk");

/**
 * Realtime streaming chunk emitted to the operator console execution rail.
 */
export const StreamChunkSchema = z
  .object({
    chunkId: z.string().min(1).describe("Sequential or UUID chunk identifier"),
    executionId: ExecutionIdSchema,
    type: StreamChunkTypeSchema,
    delta: z.string().describe("Incremental text token or serialized JSON delta payload"),
    stepIndex: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe("Associated execution step sequence number"),
    metadata: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Optional stream metadata (model, tokens)"),
    timestamp: z.date().default(() => new Date()),
  })
  .describe("Granular realtime streaming delta emitted during agent execution");

export type StreamChunk = z.infer<typeof StreamChunkSchema>;
