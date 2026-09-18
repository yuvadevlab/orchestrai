/**
 * @file packages/tools/src/builtins/filesystem/read-file.tool.ts
 * @description Safe filesystem read tool respecting the workspace sandbox jail.
 *
 * ─── Reading Files in Agent Workflows (Learning note) ───────────────
 * When an agent inspects a codebase, it frequently calls `read_file`.
 *
 * Best practices implemented here:
 * 1. Sandbox jail: Path is checked by `sanitizePath` to prevent directory traversal.
 * 2. Windowing/pagination: Supports `startLine` and `lineCount` so the LLM doesn't
 *    overflow its context window trying to ingest a 10,000-line minified file.
 * 3. Permission tier: READ_ONLY — zero side-effects.
 * ───────────────────────────────────────────────────────────────────
 */

import fs from "node:fs/promises";
import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ToolDefinition } from "@orchestrai/core";
import type { ITool, ToolExecutionContext } from "@/interfaces";
import { sanitizePath } from "@/security";

/**
 * Input arguments schema for ReadFileTool.
 */
export const ReadFileInputSchema = z.object({
  path: z.string().min(1).describe("Relative or absolute file path to read"),
  startLine: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("1-indexed starting line number to read from"),
  lineCount: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Maximum number of lines to return from startLine"),
});

export type ReadFileInput = z.infer<typeof ReadFileInputSchema>;

/**
 * Output shape returned by ReadFileTool.
 */
export interface ReadFileOutput {
  readonly content: string;
  readonly totalLines: number;
  readonly returnedLines: number;
  readonly byteSize: number;
}

/**
 * Tool for reading text file contents safely within the permitted workspace directory.
 */
export class ReadFileTool implements ITool<ReadFileInput, ReadFileOutput> {
  public readonly definition: ToolDefinition = {
    name: "read_file",
    description:
      "Reads text file contents from the workspace. Supports line-range windowing for large files.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    parametersSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative or absolute file path to read",
        },
        startLine: {
          type: "integer",
          minimum: 1,
          description: "1-indexed starting line number",
        },
        lineCount: {
          type: "integer",
          minimum: 1,
          description: "Maximum number of lines to return",
        },
      },
      required: ["path"],
    },
    timeoutMs: 15_000,
    isDestructive: false,
  };

  public readonly inputSchema = ReadFileInputSchema;

  /**
   * Reads the target file content with sandbox verification and optional line slicing.
   */
  async execute(args: ReadFileInput, context: ToolExecutionContext): Promise<ReadFileOutput> {
    const root = context.workspaceRoot ?? process.cwd();
    const safePath = sanitizePath(args.path, root);

    const raw = await fs.readFile(safePath, "utf8");
    const lines = raw.split(/\r?\n/);
    const totalLines = lines.length;

    let sliced = lines;
    if (args.startLine !== undefined) {
      const startIndex = Math.max(0, args.startLine - 1);
      const count = args.lineCount ?? totalLines;
      sliced = lines.slice(startIndex, startIndex + count);
    } else if (args.lineCount !== undefined) {
      sliced = lines.slice(0, args.lineCount);
    }

    const content = sliced.join("\n");
    const byteSize = Buffer.byteLength(content, "utf8");

    return {
      content,
      totalLines,
      returnedLines: sliced.length,
      byteSize,
    };
  }
}
