"use client";

/**
 * @file studio-workspace.tsx
 * @description Master Universal Cowork Studio Workspace integrating threaded sessions and live agent runs.
 * @module apps/console/features/studio/components
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StudioHeader } from "./studio-header";
import { SessionDrawer } from "./session-drawer";
import { StudioWelcome } from "./studio-welcome";
import { StudioMessageItem } from "./studio-message-item";
import { StudioPromptBar } from "./studio-prompt-bar";
import { StudioInspectorRail } from "./studio-inspector-rail";
import { useSessionStore } from "../hooks/use-session-store";
import { useAgentRunner } from "../hooks/use-agent-runner";
import { useAgents } from "@/features/agents/api";
import { useModels } from "@/features/models/api";
import { usePlatformModes } from "@/lib/use-modes";
import { getStoredSession } from "@/lib/auth";
import type { SpecialistPersona } from "../types";

export interface StudioWorkspaceProps {
  routeSessionId?: string;
}

/**
 * Universal Autonomous Cowork Studio Workspace.
 * Dynamically queries and binds cluster specialist agents from the database.
 */
export function StudioWorkspace({ routeSessionId }: StudioWorkspaceProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const urlPrompt = searchParams.get("prompt") || "";

  const { data: dbAgents = [] } = useAgents();
  const { data: models } = useModels();
  const { data: platformModes = [] } = usePlatformModes();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [prompt, setPrompt] = useState(urlPrompt);

  const autoRunRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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

  const activeSpecialist: SpecialistPersona | undefined = useMemo(() => {
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
    onUpdateMessages: updateActiveMessages,
  });

  const session = getStoredSession();
  const userFirstName = session?.user?.name ? session.user.name.split(" ")[0] : null;

  // Auto-scroll on new message or stream chunk
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
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
      triggerRun(urlPrompt);
    }
  }, [urlPrompt, triggerRun]);

  const handleSubmit = (customText?: string): void => {
    const text = (customText ?? prompt).trim();
    if (!text) return;
    setPrompt("");
    triggerRun(text);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Top Control Header */}
      <StudioHeader
        isRunning={isRunning}
        onOpenHistory={() => setDrawerOpen((p) => !p)}
        onToggleRail={() => setRailOpen((p) => !p)}
        railOpen={railOpen}
      />

      {/* Main Workspace Body with in-flow sidebars */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Side: Session History Drawer */}
        <SessionDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewSession={() => {
            createNewSession();
            clearEvents();
          }}
          onDeleteSession={deleteSession}
        />

        {/* Center: Main Canvas Feed & Prompt Station */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            {activeSession.messages.length === 0 ? (
              <StudioWelcome
                onSelectPrompt={(p) => handleSubmit(p)}
                userFirstName={userFirstName}
              />
            ) : (
              <div className="divide-border/20 mx-auto flex w-full max-w-4xl flex-col divide-y">
                {activeSession.messages.map((m) => (
                  <StudioMessageItem key={m.id} message={m} onResolveApproval={resolveApproval} />
                ))}
              </div>
            )}
          </div>

          {/* Floating Command Input Station */}
          <StudioPromptBar
            prompt={prompt}
            onChange={setPrompt}
            onSubmit={() => handleSubmit()}
            onStop={stopExecution}
            isRunning={isRunning}
            specialists={specialists}
            selectedSpecialistId={activeSpecialist?.id || ""}
            onSelectSpecialist={(id) => updateSessionMeta({ specialistId: id })}
            models={models}
            selectedModel={activeSession.model || ""}
            onSelectModel={(model) => updateSessionMeta({ model })}
            modes={platformModes}
            mode={activeSession.mode}
            onSelectMode={(mode) => updateSessionMeta({ mode })}
          />
        </main>

        {/* Right Side: Collapsible Inspector Rail */}
        {railOpen && (
          <aside className="border-border hidden w-80 shrink-0 border-l lg:block">
            <StudioInspectorRail
              events={events}
              isRunning={isRunning}
              activeExecutionId={activeExecutionId}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
