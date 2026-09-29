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
      // Only persist durable state across page reloads (sessions, canvas draft, tickets)
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        messages: state.messages,
        draftCode: state.draftCode,
        isCanvasOpen: state.isCanvasOpen,
        canvasMode: state.canvasMode,
        activeArtifact: state.activeArtifact,
        resolvedHistory: state.resolvedHistory,
      }),
    },
  ),
);
