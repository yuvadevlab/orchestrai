/**
 * @file apps/gateway/src/services/permission-storage.ts
 * @description Local persistent permissions file storage and workspace project root resolution.
 * @module apps/gateway/services
 */

import fs from "node:fs";
import path from "node:path";
import { PermissionScope } from "@orchestrai/shared-types";

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

/**
 * Applies a permission grant (once, session, or permanent) to active permission sets.
 */
export function applyGrant(
  scope: PermissionScope,
  isBash: boolean,
  target: string,
  prefix: string,
  targetSessions: string[],
  onceGrants: Set<string>,
  sessionGrants: Map<string, Set<string>>,
  permanentGrants: Set<string>,
  configPath: string,
): void {
  if (scope === PermissionScope.ONCE) {
    if (isBash) onceGrants.add("tool:bash");
    onceGrants.add(target);
  } else if (scope === PermissionScope.SESSION) {
    const grantKey = isBash ? "tool:bash" : prefix;
    for (const s of targetSessions) {
      if (!sessionGrants.has(s)) sessionGrants.set(s, new Set());
      sessionGrants.get(s)?.add(grantKey);
      if (isBash) sessionGrants.get(s)?.add(target);
    }
  } else if (scope === PermissionScope.PERMANENT) {
    const grantKey = isBash ? "tool:bash" : prefix;
    permanentGrants.add(grantKey);
    if (isBash) permanentGrants.add(target);
    savePermanentPermissions(configPath, permanentGrants);
  }
}
