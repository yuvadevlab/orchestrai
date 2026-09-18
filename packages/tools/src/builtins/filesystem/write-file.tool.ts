/**
 * @file packages/tools/src/builtins/filesystem/write-file.tool.ts
 * @description Safe filesystem write tool with sandbox jail containment.
 *
 * ─── Writing Files Safely in AI Agents (Learning note) ──────────────
 * When an agent writes code or documentation:
 * 1. Sandbox jail: Target path cannot escape `workspaceRoot`.
 * 2. Automatic directory creation: If `src/sub/dir/file.ts` is requested,
 *    parent folders are created recursively so the agent doesn't fail on missing directories.
 * 3. Permission tier: WRITE_SAFE — local disk modification within workspace.
 * ───────────────────────────────────────────────────────────────────
 */

import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ToolDefinition } from "@orchestrai/core";
import type { ITool, ToolExecutionContext } from "@/interfaces";
import { sanitizePath } from "@/security";

/**
 * Input arguments schema for WriteFileTool.
 */
export const WriteFileInputSchema = z.object({
  path: z.string().min(1).describe("Target file path to write to"),
  content: z.string().describe("Text content to write into the file"),
  createDirectories: z
    .boolean()
    .default(true)
    .describe("Whether to automatically create missing parent directories"),
});

export type WriteFileInput = z.infer<typeof WriteFileInputSchema>;

/**
 * Output shape returned by WriteFileTool.
 */
export interface WriteFileOutput {
  readonly path: string;
  readonly byteSize: number;
  readonly linesWritten: number;
  readonly isCreated: boolean;
}

/**
 * Tool for creating or overwriting text files within the workspace sandbox.
 */
export class WriteFileTool implements ITool<WriteFileInput, WriteFileOutput> {
  public readonly definition: ToolDefinition = {
    name: "write_file",
    description:
      "Writes text content to a file in the workspace. Automatically creates missing parent directories.",
    permissionLevel: ToolPermissionLevel.WRITE_SAFE,
    parametersSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Target file path to write to",
        },
        content: {
          type: "string",
          description: "Text content to write",
        },
        createDirectories: {
          type: "boolean",
          default: true,
          description: "Create missing parent directories",
        },
      },
      required: ["path", "content"],
    },
    timeoutMs: 15_000,
    isDestructive: false,
  };

  public readonly inputSchema = WriteFileInputSchema;

  /**
   * Writes the specified content to disk within the sandbox boundary.
   */
  async execute(args: WriteFileInput, context: ToolExecutionContext): Promise<WriteFileOutput> {
    const root = context.workspaceRoot ?? process.cwd();
    const safePath = sanitizePath(args.path, root);

    // Check if file already existed
    let isCreated = true;
    try {
      await fs.access(safePath);
      isCreated = false;
    } catch {
      isCreated = true;
    }

    // Ensure parent directory exists if requested
    if (args.createDirectories) {
      const parentDir = path.dirname(safePath);
      await fs.mkdir(parentDir, { recursive: true });
    }

    await fs.writeFile(safePath, args.content, "utf8");

    const byteSize = Buffer.byteLength(args.content, "utf8");
    const linesWritten = args.content.split(/\r?\n/).length;

    return {
      path: safePath,
      byteSize,
      linesWritten,
      isCreated,
    };
  }
}
