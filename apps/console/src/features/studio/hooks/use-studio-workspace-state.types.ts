/**
 * @file use-studio-workspace-state.types.ts
 * @description Type definitions for the useStudioWorkspaceState hook.
 * @module apps/console/features/studio/hooks
 */

import type React from "react";
import type { PermissionScope, PlatformModeRecord } from "@orchestrai/shared-types";
import type { LlmModel } from "@/features/models/types";
import type {
  CoworkSession,
  SpecialistPersona,
  StudioApprovalRequest,
  StudioEvent,
} from "../types";

/** Options for the studio workspace state hook */
export interface UseStudioWorkspaceStateOptions {
  routeSessionId?: string;
  urlPrompt?: string;
}

/** Return interface for the useStudioWorkspaceState hook */
export interface UseStudioWorkspaceStateReturn {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  railOpen: boolean;
  setRailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  bottomSentinelRef: React.RefObject<HTMLDivElement | null>;
  sessions: CoworkSession[];
  activeSession: CoworkSession;
  activeSessionId: string;
  activeSpecialist: SpecialistPersona | undefined;
  specialists: SpecialistPersona[];
  models: LlmModel[] | undefined;
  platformModes: PlatformModeRecord[];
  userFirstName?: string | null;
  isRunning: boolean;
  events: StudioEvent[];
  activeExecutionId: string | null;
  pendingApproval: StudioApprovalRequest | null;
  streamingActivityLabel: string | undefined;
  handleSelectSession: (id: string) => void;
  handleNewSession: () => void;
  handleDeleteSession: (id: string) => void;
  handleApprovalResolved: (approvalId: string, scope: PermissionScope, resolvedAt: string) => void;
  handleSubmit: (customText?: string) => void;
  resolveApproval: (approvalId: string, scope: PermissionScope) => Promise<void>;
  stopExecution: () => void;
  updateSessionMeta: (patch: Partial<CoworkSession>) => void;
}
