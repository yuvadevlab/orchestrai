/**
 * @file apps/console/src/lib/stores/index.ts
 * @description Master Zustand store unifying Session, Canvas, Execution, and Clearance slices.
 * Persists offline conversation history and draft artifacts via asynchronous IndexedDB storage.
 * @module apps/console/lib/stores
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDbStorage } from "@/lib/storage/indexed-db-storage";
import { createSessionSlice, type SessionSlice } from "./session-slice";
import { createCanvasSlice, type CanvasSlice } from "./canvas-slice";
import { createExecutionSlice, type ExecutionSlice } from "./execution-slice";
import { createClearanceSlice, type ClearanceSlice } from "./clearance-slice";
import { createWorkspaceSlice, type WorkspaceSlice } from "./workspace-slice";

export * from "./session-slice";
export * from "./canvas-slice";
export * from "./execution-slice";
export * from "./clearance-slice";
export * from "./workspace-slice";

/**
 * Unified console application state type combining all 5 domain slices.
 */
export type ConsoleStoreState = SessionSlice &
  CanvasSlice &
  ExecutionSlice &
  ClearanceSlice &
  WorkspaceSlice;

/**
 * Global reactive state hook for OrchestrAI Console backed by IndexedDB.
 */
export const useConsoleStore = create<ConsoleStoreState>()(
  persist(
    (...args) => ({
      ...createSessionSlice(...args),
      ...createCanvasSlice(...args),
      ...createExecutionSlice(...args),
      ...createClearanceSlice(...args),
      ...createWorkspaceSlice(...args),
    }),
    {
      name: "orchestrai-console-store",
      storage: createJSONStorage(() => indexedDbStorage),
      // Persist durable conversation state and workspace history across reloads
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        messages: state.messages,
        resolvedHistory: state.resolvedHistory,
        activeWorkspace: state.activeWorkspace,
        recentWorkspaces: state.recentWorkspaces,
      }),
      /**
       * One-time migration on rehydration: forcibly clear any stale canvas state
       * that was persisted by older versions of this store before `activeArtifact`
       * and `isCanvasOpen` were removed from `partialize`.
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setActiveArtifact(null);
          state.setCanvasOpen(false);
        }
      },
    },
  ),
);
