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

export * from "./session-slice";
export * from "./canvas-slice";
export * from "./execution-slice";
export * from "./clearance-slice";

/**
 * Unified console application state type combining all 4 tri-tier domain slices.
 */
export type ConsoleStoreState = SessionSlice & CanvasSlice & ExecutionSlice & ClearanceSlice;

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
    }),
    {
      name: "orchestrai-console-store",
      storage: createJSONStorage(() => indexedDbStorage),
      // Only persist durable conversation state across page reloads.
      // Canvas artifact and open state are ephemeral UI — they must NOT persist
      // because a stale activeArtifact would bleed into new sessions on next load.
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        messages: state.messages,
        resolvedHistory: state.resolvedHistory,
      }),
      /**
       * One-time migration on rehydration: forcibly clear any stale canvas state
       * that was persisted by older versions of this store before `activeArtifact`
       * and `isCanvasOpen` were removed from `partialize`.
       * Without this, a stale artifact written in a prior session would open the
       * canvas immediately on the next page load.
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
