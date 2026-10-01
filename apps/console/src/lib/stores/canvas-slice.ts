/**
 * @file apps/console/src/lib/stores/canvas-slice.ts
 * @description Zustand store slice governing interactive Dual-Pane Workspace Canvas state.
 * @module apps/console/lib/stores
 */

import type { StateCreator } from "zustand";

/**
 * Display view mode for the interactive right-hand canvas pane.
 */
export type CanvasMode = "code" | "preview" | "diff" | "terminal";

/**
 * Interactive artifact rendered within the canvas pane.
 */
export interface CanvasArtifact {
  readonly id: string;
  readonly title: string;
  readonly language?: string;
  readonly code: string;
  readonly diffOriginal?: string;
  readonly diffModified?: string;
  readonly terminalLogs?: string[];
  readonly version?: number;
}

/**
 * State and actions for the Dual-Pane Canvas.
 */
export interface CanvasSlice {
  isCanvasOpen: boolean;
  canvasMode: CanvasMode;
  activeArtifact: CanvasArtifact | null;
  draftCode: string;

  setCanvasOpen: (isOpen: boolean) => void;
  toggleCanvas: () => void;
  setCanvasMode: (mode: CanvasMode) => void;
  setActiveArtifact: (artifact: CanvasArtifact | null) => void;
  setDraftCode: (code: string) => void;
  updateActiveArtifactCode: (code: string) => void;
  appendTerminalLog: (logLine: string) => void;
}

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set) => ({
  isCanvasOpen: false,
  canvasMode: "code",
  activeArtifact: null,
  draftCode: "",

  setCanvasOpen: (isOpen) => set({ isCanvasOpen: isOpen }),
  toggleCanvas: () => set((state) => ({ isCanvasOpen: !state.isCanvasOpen })),
  setCanvasMode: (mode) => set({ canvasMode: mode }),
  setActiveArtifact: (artifact) =>
    set({
      activeArtifact: artifact,
      draftCode: artifact?.code ?? "",
      isCanvasOpen: artifact !== null,
    }),
  setDraftCode: (code) => set({ draftCode: code }),
  updateActiveArtifactCode: (code) =>
    set((state) => ({
      draftCode: code,
      activeArtifact: state.activeArtifact ? { ...state.activeArtifact, code } : null,
    })),
  appendTerminalLog: (logLine) =>
    set((state) => {
      if (!state.activeArtifact) return state;
      const logs = state.activeArtifact.terminalLogs ?? [];
      return {
        activeArtifact: {
          ...state.activeArtifact,
          terminalLogs: [...logs, logLine],
        },
      };
    }),
});
