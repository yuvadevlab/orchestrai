/**
 * @file apps/gateway/src/modules/workspace/services/workspace-file.service.ts
 * @description Safe directory scanner and fuzzy file search for workspace contexts and @ mentions.
 * @module apps/gateway/modules/workspace/services
 */

import fs from "node:fs/promises";
import path from "node:path";
import { BACKSLASH_GLOBAL_REGEX } from "@orchestrai/regex";
import { resolveMonorepoRoot } from "@/modules/streaming/autonomous-agent-runner";

/**
 * Metadata record for a discovered workspace file or directory.
 */
export interface WorkspaceFileEntry {
  readonly path: string;
  readonly name: string;
  readonly type: "file" | "directory";
  readonly extension: string;
}

/** Default ignored directories that are excluded from workspace scanning. */
const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".venv",
  "coverage",
  "__pycache__",
  ".data",
  ".cache",
  ".output",
  ".gemini",
  ".agents",
]);

/**
 * Recursively scans a workspace directory up to maxDepth and collects files.
 */
async function scanDirectory(
  currentDir: string,
  rootPath: string,
  depth: number,
  maxDepth: number,
  collected: WorkspaceFileEntry[],
  maxFiles: number,
): Promise<void> {
  if (depth > maxDepth || collected.length >= maxFiles) return;

  try {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (collected.length >= maxFiles) break;

      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootPath, fullPath).replace(BACKSLASH_GLOBAL_REGEX, "/");

      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name) && !entry.name.startsWith(".")) {
          await scanDirectory(fullPath, rootPath, depth + 1, maxDepth, collected, maxFiles);
        }
      } else if (entry.isFile()) {
        collected.push({
          path: relativePath,
          name: entry.name,
          type: "file",
          extension: path.extname(entry.name).toLowerCase(),
        });
      }
    }
  } catch {
    // Gracefully ignore unreadable directories (permission errors, broken symlinks)
  }
}

/**
 * Service providing safe workspace file exploration and filtering.
 */
export class WorkspaceFileService {
  /**
   * Scans and returns workspace files, optionally filtered by search query.
   *
   * @param targetPath - Optional directory path; falls back to monorepo root
   * @param query - Optional substring match filter
   * @param limit - Maximum items to return (default 100)
   */
  public async listFiles(
    targetPath?: string,
    query?: string,
    limit: number = 100,
  ): Promise<WorkspaceFileEntry[]> {
    const root =
      targetPath && targetPath.trim().length > 0 ? path.resolve(targetPath) : resolveMonorepoRoot();

    try {
      const stat = await fs.stat(root);
      if (!stat.isDirectory()) {
        return [];
      }
    } catch {
      return [];
    }

    const collected: WorkspaceFileEntry[] = [];
    await scanDirectory(root, root, 0, 5, collected, Math.min(limit * 3, 500));

    if (!query || query.trim().length === 0) {
      return collected.slice(0, limit);
    }

    const lowerQuery = query.toLowerCase().trim();
    return collected
      .filter(
        (file) =>
          file.path.toLowerCase().includes(lowerQuery) ||
          file.name.toLowerCase().includes(lowerQuery),
      )
      .slice(0, limit);
  }
}

export const workspaceFileService = new WorkspaceFileService();
