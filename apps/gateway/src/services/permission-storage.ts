/**
 * @file apps/gateway/src/services/permission-storage.ts
 * @description Local persistent permissions file storage and workspace project root resolution.
 * @module apps/gateway/services
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Finds the nearest project root (e.g. containing package.json or .git) for an external path.
 */
export function findNearestProjectRoot(targetPath: string): string {
  let dir =
    fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()
      ? path.resolve(targetPath)
      : path.dirname(path.resolve(targetPath));

  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, "package.json")) ||
      fs.existsSync(path.join(dir, ".git")) ||
      fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return path.dirname(path.resolve(targetPath));
}

/**
 * Loads permanent trusted workspaces array from .orchestrai/permissions.json.
 */
export function loadPermanentPermissions(configPath: string): Set<string> {
  const grants = new Set<string>();
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.trustedWorkspaces)) {
        for (const p of parsed.trustedWorkspaces) {
          grants.add(path.resolve(String(p)));
        }
      }
    }
  } catch {
    // Missing or malformed config
  }
  return grants;
}

/**
 * Persists permanent trusted workspaces array to .orchestrai/permissions.json.
 */
export function savePermanentPermissions(configPath: string, grants: Set<string>): void {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      configPath,
      JSON.stringify({ trustedWorkspaces: Array.from(grants) }, null, 2),
    );
  } catch {
    // Filesystem restricted
  }
}
