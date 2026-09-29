"use client";

/**
 * @file studio-workspace.tsx
 * @description Master Universal Cowork Studio Workspace integrating threaded sessions, virtualized feed, and Dual-Pane Canvas.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { useSearchParams } from "next/navigation";
import { StudioHeader } from "./studio-header";
import { SessionDrawer } from "./session-drawer";
import { StudioWelcome } from "./studio-welcome";
import { StudioPromptBar } from "./studio-prompt-bar";
import { StudioInspectorRail } from "./studio-inspector-rail";
import { VirtualizedMessageFeed } from "./virtualized-message-feed";
import { CanvasPane } from "./canvas/canvas-pane";
import { useStudioWorkspaceState } from "../hooks/use-studio-workspace-state";
import { useConsoleStore } from "@/lib/stores";
import type { CoworkMode } from "../types";

export interface StudioWorkspaceProps {
  routeSessionId?: string;
}

/**
 * Universal Autonomous Cowork Studio Workspace.
 * Dynamically queries and binds cluster specialist agents, models, and dual-pane canvas.
 */
export function StudioWorkspace({ routeSessionId }: StudioWorkspaceProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const urlPrompt = searchParams.get("prompt") || "";

  const state = useStudioWorkspaceState({
    routeSessionId,
    urlPrompt,
  });

  const isCanvasOpen = useConsoleStore((s) => s.isCanvasOpen);
  const activeArtifact = useConsoleStore((s) => s.activeArtifact);
  const hasActiveCanvas = isCanvasOpen && activeArtifact !== null;

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

        {/* Center: Conversational Feed & Floating Prompt Bar */}
        <main
          className={`relative flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
            hasActiveCanvas ? "lg:w-1/2 lg:flex-none" : "w-full"
          }`}
        >
          <div ref={state.chatScrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            {state.activeSession.messages.length === 0 ? (
              <StudioWelcome
                onSelectPrompt={(p) => state.setPrompt(p)}
                userFirstName={state.userFirstName}
              />
            ) : (
              <VirtualizedMessageFeed
                messages={state.activeSession.messages}
                chatScrollRef={state.chatScrollRef}
                bottomSentinelRef={state.bottomSentinelRef}
              />
            )}
          </div>

          {/* Floating Command Input Station */}
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

        {/* Right Side: Dual-Pane Interactive Canvas Pane */}
        {hasActiveCanvas && (
          <section className="hidden min-w-0 flex-1 overflow-hidden lg:flex">
            <CanvasPane />
          </section>
        )}

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
