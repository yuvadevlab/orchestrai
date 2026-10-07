/**
 * @file apps/console/src/lib/stores/workspace-slice.ts
 * @description Workspace management slice tracking active project directory and recent workspace history.
 * @module apps/console/lib/stores
 */

import type { StateCreator } from "zustand";
import { TRAILING_PATH_SLASH_REGEX, PATH_SPLIT_REGEX } from "@orchestrai/regex";

/**
 * Record representing a local workspace or project folder.
 */
export interface WorkspaceRecord {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly lastOpenedAt: number;
}

/**
 * Workspace slice state and actions.
 */
export interface WorkspaceSlice {
  readonly activeWorkspace: WorkspaceRecord | null;
  readonly recentWorkspaces: readonly WorkspaceRecord[];
  readonly setActiveWorkspace: (workspace: WorkspaceRecord) => void;
  readonly openWorkspaceByPath: (dirPath: string, customName?: string) => WorkspaceRecord;
  readonly removeRecentWorkspace: (workspaceId: string) => void;
  readonly clearWorkspaceHistory: () => void;
}

/**
 * Helper to derive a clean human-readable folder name from an absolute path.
 */
function deriveFolderName(dirPath: string): string {
  const normalized = dirPath.replace(TRAILING_PATH_SLASH_REGEX, "");
  const segments = normalized.split(PATH_SPLIT_REGEX);
  return segments[segments.length - 1] || "workspace";
}

/**
 * Resolves initial default workspace dynamically from environment configuration.
 * Returns null if no WORKSPACE_ROOT environment variable is provided.
 */
function resolveInitialWorkspace(): WorkspaceRecord | null {
  const envPath =
    typeof process !== "undefined" && process.env?.WORKSPACE_ROOT
      ? process.env.WORKSPACE_ROOT.trim()
      : "";
  if (!envPath) {
    return null;
  }
  const folderName = deriveFolderName(envPath);
  return {
    id: `ws-${folderName}`,
    name: folderName,
    path: envPath,
    lastOpenedAt: Date.now(),
  };
}

const INITIAL_WORKSPACE = resolveInitialWorkspace();

/**
 * Creates the workspace slice for tracking active and historical project folders.
 */
export const createWorkspaceSlice: StateCreator<WorkspaceSlice, [], [], WorkspaceSlice> = (
  set,
) => ({
  activeWorkspace: INITIAL_WORKSPACE,
  recentWorkspaces: INITIAL_WORKSPACE ? [INITIAL_WORKSPACE] : [],

  setActiveWorkspace: (workspace: WorkspaceRecord): void => {
    set((state) => {
      const updated: WorkspaceRecord = {
        ...workspace,
        lastOpenedAt: Date.now(),
      };
      // Prepend or move to front of recent workspaces list
      const filtered = state.recentWorkspaces.filter(
        (w) => w.id !== workspace.id && w.path !== workspace.path,
      );
      return {
        activeWorkspace: updated,
        recentWorkspaces: [updated, ...filtered].slice(0, 15), // keep up to 15 recent
      };
    });
  },

  openWorkspaceByPath: (dirPath: string, customName?: string): WorkspaceRecord => {
    const trimmedPath = dirPath.trim();
    const folderName = customName?.trim() || deriveFolderName(trimmedPath);
    const newRecord: WorkspaceRecord = {
      id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: folderName,
      path: trimmedPath,
      lastOpenedAt: Date.now(),
    };

    set((state) => {
      // Check if this path was already opened before
      const existing = state.recentWorkspaces.find((w) => w.path === trimmedPath);
      const recordToUse = existing ? { ...existing, lastOpenedAt: Date.now() } : newRecord;

      const filtered = state.recentWorkspaces.filter((w) => w.path !== trimmedPath);
      return {
        activeWorkspace: recordToUse,
        recentWorkspaces: [recordToUse, ...filtered].slice(0, 15),
      };
    });

    return newRecord;
  },

  removeRecentWorkspace: (workspaceId: string): void => {
    set((state) => {
      const filtered = state.recentWorkspaces.filter((w) => w.id !== workspaceId);
      // If we removed the active one, fallback to the next available or null
      const nextActive =
        state.activeWorkspace?.id === workspaceId ? (filtered[0] ?? null) : state.activeWorkspace;
      return {
        recentWorkspaces: filtered,
        activeWorkspace: nextActive,
      };
    });
  },

  clearWorkspaceHistory: (): void => {
    set((state) => ({
      recentWorkspaces: state.activeWorkspace ? [state.activeWorkspace] : [],
    }));
  },
});
