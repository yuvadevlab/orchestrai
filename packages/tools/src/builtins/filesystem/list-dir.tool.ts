/**
 * @file packages/tools/src/builtins/filesystem/list-dir.tool.ts
 * @description Safe directory listing tool with sandbox boundary enforcement.
 *
 * ─── Directory Exploration in AI Agents (Learning note) ─────────────
 * When an agent explores a repository, `list_directory` gives it the tree structure.
 *
 * Key guardrails:
 * 1. Sandbox jail: Evaluates through `sanitizePath`.
 * 2. Result bounding: Caps maximum returned entries to prevent overwhelming
 *    the LLM context with giant `node_modules` or `.git` trees.
 * 3. Permission tier: READ_ONLY.
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
 * Input arguments schema for ListDirectoryTool.
 */
export const ListDirectoryInputSchema = z.object({
  path: z.string().default(".").describe("Relative or absolute directory path to list"),
  recursive: z
    .boolean()
    .default(false)
    .describe("Whether to list subdirectories recursively (capped by maxEntries)"),
  maxEntries: z
    .number()
    .int()
    .positive()
    .default(100)
    .describe("Maximum entries returned to prevent context overflow"),
});

export type ListDirectoryInput = z.infer<typeof ListDirectoryInputSchema>;

/**
 * Single entry within a directory listing.
 */
export interface DirectoryListingEntry {
  readonly name: string;
  readonly isDirectory: boolean;
  readonly path: string;
  readonly sizeBytes?: number;
}

/**
 * Output shape returned by ListDirectoryTool.
 */
export interface ListDirectoryOutput {
  readonly directory: string;
  readonly entries: readonly DirectoryListingEntry[];
  readonly totalCount: number;
  readonly isTruncated: boolean;
}

/**
 * Tool for listing directories within the workspace sandbox.
 */
export class ListDirectoryTool implements ITool<ListDirectoryInput, ListDirectoryOutput> {
  public readonly definition: ToolDefinition = {
    name: "list_directory",
    description:
      "Lists files and subdirectories within a permitted workspace folder. Safe, bounded, and sandbox-jailed.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    parametersSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          default: ".",
          description: "Target directory path",
        },
        recursive: {
          type: "boolean",
          default: false,
          description: "Scan subdirectories recursively",
        },
        maxEntries: {
          type: "integer",
          default: 100,
          description: "Maximum entries to return",
        },
      },
    },
    timeoutMs: 15_000,
    isDestructive: false,
  };

  public readonly inputSchema = ListDirectoryInputSchema;

  /**
   * Lists the contents of the target directory safely.
   */
  async execute(
    args: ListDirectoryInput,
    context: ToolExecutionContext,
  ): Promise<ListDirectoryOutput> {
    const root = context.workspaceRoot ?? process.cwd();
    const safeDir = sanitizePath(args.path, root);

    const collected: DirectoryListingEntry[] = [];
    let isTruncated = false;

    const scan = async (dir: string): Promise<void> => {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        if (collected.length >= args.maxEntries) {
          isTruncated = true;
          return;
        }

        // Skip heavy node_modules / .git directories by default
        if (item.name === "node_modules" || item.name === ".git") {
          continue;
        }

        const fullPath = path.join(dir, item.name);
        const relPath = path.relative(root, fullPath);
        const isDir = item.isDirectory();

        let sizeBytes: number | undefined;
        if (!isDir) {
          try {
            const stat = await fs.stat(fullPath);
            sizeBytes = stat.size;
          } catch {
            sizeBytes = undefined;
          }
        }

        collected.push({
          name: item.name,
          isDirectory: isDir,
          path: relPath,
          sizeBytes,
        });

        if (args.recursive && isDir) {
          await scan(fullPath);
          if (isTruncated) return;
        }
      }
    };

    await scan(safeDir);

    return {
      directory: path.relative(root, safeDir) || ".",
      entries: collected,
      totalCount: collected.length,
      isTruncated,
    };
  }
}
