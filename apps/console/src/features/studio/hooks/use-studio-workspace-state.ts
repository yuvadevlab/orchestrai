/**
 * @file use-studio-workspace-state.ts
 * @description Hook managing session lifecycle, model selection, specialist binding, and execution for StudioWorkspace.
 * @module apps/console/features/studio/hooks
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/features/agents/api";
import { useModels } from "@/features/models/api";
import { usePlatformModes } from "@/lib/hooks";
import { getStoredSession } from "@/lib/auth";
import { useConsoleStore } from "@/lib/stores";
import { useSessionStore } from "./use-session-store";
import { useAgentRunner } from "./use-agent-runner";
import { useStudioApproval } from "./use-studio-approval";
import type { SpecialistPersona } from "../types";
import type {
  UseStudioWorkspaceStateOptions,
  UseStudioWorkspaceStateReturn,
} from "./use-studio-workspace-state.types";

export type { UseStudioWorkspaceStateOptions, UseStudioWorkspaceStateReturn };

/**
 * Encapsulates the entire reactive state and side-effects for the Universal Cowork Studio.
 */
export function useStudioWorkspaceState({
  routeSessionId,
  urlPrompt = "",
}: UseStudioWorkspaceStateOptions): UseStudioWorkspaceStateReturn {
  const router = useRouter();

  // Canvas reset action — used to clear stale artifacts when switching sessions
  const setActiveArtifact = useConsoleStore((s) => s.setActiveArtifact);
  const activeWorkspace = useConsoleStore((s) => s.activeWorkspace);

  const { data: dbAgents = [] } = useAgents();
  const { data: models } = useModels();
  const { data: platformModes = [] } = usePlatformModes();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [prompt, setPrompt] = useState(urlPrompt);

  const autoRunRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    updateActiveMessages,
    updateSessionMeta,
    deleteSession,
  } = useSessionStore(routeSessionId);

  // Map database agents into specialist personas dynamically
  const specialists = useMemo<SpecialistPersona[]>(() => {
    if (!dbAgents || dbAgents.length === 0) return [];
    return dbAgents.map((a) => ({
      id: a.id,
      name: a.name,
      domain: a.role || "General",
      role: a.description || a.role || "Specialist",
      description: a.description || "Active cluster specialist",
    }));
  }, [dbAgents]);

  const activeSpecialist = useMemo<SpecialistPersona | undefined>(() => {
    return specialists.find((s) => s.id === activeSession.specialistId) || specialists[0];
  }, [specialists, activeSession.specialistId]);

  // Synchronize active session specialist with first available database agent
  useEffect(() => {
    if (specialists.length > 0) {
      const exists = specialists.some((s) => s.id === activeSession.specialistId);
      if (!exists && specialists[0]) {
        updateSessionMeta({ specialistId: specialists[0].id });
      }
    }
  }, [specialists, activeSession.specialistId, updateSessionMeta]);

  const {
    isRunning,
    events,
    activeExecutionId,
    triggerRun,
    resolveApproval,
    stopExecution,
    clearEvents,
  } = useAgentRunner({
    activeSpecialist,
    selectedModel: activeSession.model || "",
    activeSessionId,
    existingMessages: activeSession.messages,
    workspacePath: activeWorkspace?.path,
    onUpdateMessages: updateActiveMessages,
  });

  const session = getStoredSession();
  const userFirstName = session?.user?.name ? (session.user.name.split(" ")[0] ?? null) : null;

  // Manage clearance tickets and response-stream audit stamps
  const { pendingApproval, handleApprovalResolved } = useStudioApproval({
    isRunning,
    messages: activeSession.messages,
    updateActiveMessages,
  });

  /**
   * Derive a human-readable activity label from the last streaming message's thinking block.
   */
  const streamingActivityLabel = useMemo(() => {
    if (!isRunning) return undefined;
    const streamingMsg = [...activeSession.messages].reverse().find((m) => m.isStreaming);
    return streamingMsg?.thinking?.text?.split("\n")[0] ?? undefined;
  }, [activeSession.messages, isRunning]);

  // Auto-scroll to bottom sentinel on every new token, message, or event
  useEffect(() => {
    bottomSentinelRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [activeSession.messages, isRunning]);

  // Auto-select database default model when models load
  useEffect(() => {
    if (models && models.length > 0) {
      const defaultModel = models.find((m) => m.isDefault) || models[0];
      const currentExists = models.some(
        (m) => m.modelIdentifier === activeSession.model || m.name === activeSession.model,
      );
      if (!currentExists && defaultModel) {
        updateSessionMeta({ model: defaultModel.modelIdentifier || defaultModel.name });
      }
    }
  }, [models, activeSession.model, updateSessionMeta]);

  // Auto-run if URL prompt exists
  useEffect(() => {
    if (urlPrompt && !autoRunRef.current) {
      autoRunRef.current = true;
      if (!routeSessionId) {
        window.history.replaceState(null, "", `/session/${activeSession.id}`);
      }
      triggerRun(urlPrompt);
    }
  }, [urlPrompt, triggerRun, routeSessionId, activeSession.id]);

  const handleSelectSession = useCallback(
    (id: string): void => {
      // Clear canvas so a prior session's artifact doesn't bleed into a different thread
      setActiveArtifact(null);
      setActiveSessionId(id);
      router.push(`/session/${id}`);
    },
    [router, setActiveArtifact, setActiveSessionId],
  );

  const handleNewSession = useCallback((): void => {
    // Clear canvas before creating a fresh thread — prevents stale artifact from showing
    setActiveArtifact(null);
    createNewSession();
    clearEvents();
    router.push("/");
  }, [clearEvents, createNewSession, router, setActiveArtifact]);

  const handleDeleteSession = useCallback(
    (id: string): void => {
      deleteSession(id);
      if (id === activeSessionId || id === routeSessionId) {
        router.push("/");
      }
    },
    [activeSessionId, deleteSession, routeSessionId, router],
  );

  const handleSubmit = useCallback(
    (customText?: string): void => {
      const text = (customText ?? prompt).trim();
      if (!text) return;
      setPrompt("");

      // If starting a fresh thread on root route, push ID into browser URL immediately
      if (!routeSessionId) {
        window.history.replaceState(null, "", `/session/${activeSession.id}`);
      }

      triggerRun(text);
    },
    [activeSession.id, prompt, routeSessionId, triggerRun],
  );

  return {
    prompt,
    setPrompt,
    drawerOpen,
    setDrawerOpen,
    railOpen,
    setRailOpen,
    chatScrollRef,
    bottomSentinelRef,
    sessions,
    activeSession,
    activeSessionId,
    activeSpecialist,
    specialists,
    models,
    platformModes,
    userFirstName,
    isRunning,
    events,
    activeExecutionId,
    pendingApproval,
    streamingActivityLabel,
    handleSelectSession,
    handleNewSession,
    handleDeleteSession,
    handleApprovalResolved,
    handleSubmit,
    resolveApproval,
    stopExecution,
    updateSessionMeta,
  };
}
