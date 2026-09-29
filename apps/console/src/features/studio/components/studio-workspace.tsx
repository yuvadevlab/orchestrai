"use client";

/**
 * @file studio-workspace.tsx
 * @description Master Universal Cowork Studio Workspace integrating threaded sessions and live agent runs.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { useSearchParams } from "next/navigation";
import { StudioHeader } from "./studio-header";
import { SessionDrawer } from "./session-drawer";
import { StudioWelcome } from "./studio-welcome";
import { StudioMessageItem } from "./studio-message-item";
import { StudioPromptBar } from "./studio-prompt-bar";
import { StudioInspectorRail } from "./studio-inspector-rail";
import { useStudioWorkspaceState } from "../hooks/use-studio-workspace-state";
import type { CoworkMode } from "../types";

export interface StudioWorkspaceProps {
  routeSessionId?: string;
}

/**
 * Universal Autonomous Cowork Studio Workspace.
 * Dynamically queries and binds cluster specialist agents and models.
 */
export function StudioWorkspace({ routeSessionId }: StudioWorkspaceProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const urlPrompt = searchParams.get("prompt") || "";

  const state = useStudioWorkspaceState({
    routeSessionId,
    urlPrompt,
  });

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Top Control Header */}
      <StudioHeader
        isRunning={state.isRunning}
        onOpenHistory={() => state.setDrawerOpen((p) => !p)}
        onToggleRail={() => state.setRailOpen((p) => !p)}
        railOpen={state.railOpen}
      />

      {/* Main Workspace Body with in-flow sidebars */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Side: Session History Drawer */}
        <SessionDrawer
          isOpen={state.drawerOpen}
          onClose={() => state.setDrawerOpen(false)}
          sessions={state.sessions}
          activeSessionId={state.activeSessionId}
          onSelectSession={state.handleSelectSession}
          onNewSession={state.handleNewSession}
          onDeleteSession={state.handleDeleteSession}
        />

        {/* Center: Main Canvas Feed & Prompt Station */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div ref={state.chatScrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            {state.activeSession.messages.length === 0 ? (
              <StudioWelcome
                onSelectPrompt={(p) => state.setPrompt(p)}
                userFirstName={state.userFirstName}
              />
            ) : (
              <div className="divide-border/20 mx-auto flex w-full max-w-4xl flex-col divide-y">
                {state.activeSession.messages.map((m) => (
                  <StudioMessageItem key={m.id} message={m} />
                ))}
                {/* Sentinel: scrollIntoView targets this so the viewport stays pinned to bottom */}
                <div ref={state.bottomSentinelRef} aria-hidden className="h-2 shrink-0" />
              </div>
            )}
          </div>

          {/* Floating Command Input Station — transforms into clearance card when authorization is required */}
          <StudioPromptBar
            prompt={state.prompt}
            onChange={state.setPrompt}
            onSubmit={(customText) => state.handleSubmit(customText)}
            onStop={state.stopExecution}
            isRunning={state.isRunning}
            pendingApproval={state.pendingApproval}
            onResolveApproval={state.resolveApproval}
            onApprovalResolved={state.handleApprovalResolved}
            specialists={state.specialists}
            selectedSpecialistId={state.activeSpecialist?.id || ""}
            onSelectSpecialist={(id) => state.updateSessionMeta({ specialistId: id })}
            models={state.models}
            selectedModel={state.activeSession.model || ""}
            onSelectModel={(model) => state.updateSessionMeta({ model })}
            modes={state.platformModes}
            mode={state.activeSession.mode}
            onSelectMode={(mode) => state.updateSessionMeta({ mode: mode as CoworkMode })}
          />
        </main>

        {/* Right Side: Collapsible Inspector Rail */}
        {state.railOpen && (
          <aside className="border-border hidden w-80 shrink-0 border-l lg:block">
            <StudioInspectorRail
              events={state.events}
              isRunning={state.isRunning}
              activeExecutionId={state.activeExecutionId}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
