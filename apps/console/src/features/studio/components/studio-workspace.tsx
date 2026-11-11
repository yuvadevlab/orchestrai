"use client";

/**
 * @file studio-workspace.tsx
 * @description Master Universal Cowork Studio Workspace integrating threaded sessions, virtualized feed, and Dual-Pane Canvas.
 * @module apps/console/features/studio/components
 */

import React, { useEffect } from "react";
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
import { usePlatformSuggestions } from "../api";
import { ConsoleQueryParamKey } from "@/lib/auth/types";
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
  const urlPrompt = searchParams.get(ConsoleQueryParamKey.PROMPT) || "";
  const { data: dynamicSuggestions } = usePlatformSuggestions();

  const state = useStudioWorkspaceState({
    routeSessionId,
    urlPrompt,
  });

  const isCanvasOpen = useConsoleStore((s) => s.isCanvasOpen);
  const activeArtifact = useConsoleStore((s) => s.activeArtifact);
  const setCanvasOpen = useConsoleStore((s) => s.setCanvasOpen);
  const hasActiveCanvas = isCanvasOpen && activeArtifact !== null;

  useEffect(() => {
    if (hasActiveCanvas && state.railOpen) {
      state.setRailOpen(false);
    }
  }, [hasActiveCanvas, state.railOpen, state.setRailOpen]);

  const handleToggleRail = (): void => {
    if (hasActiveCanvas) {
      setCanvasOpen(false);
    }
    state.setRailOpen((p) => !p);
  };

  return (
    <div className="orch-studio">
      {/* Top Control Header */}
      <StudioHeader
        isRunning={state.isRunning}
        onOpenHistory={() => state.setDrawerOpen((p) => !p)}
        onToggleRail={handleToggleRail}
        railOpen={state.railOpen}
      />

      {/* Main Workspace Body with in-flow sidebars */}
      <div className="orch-studio__body">
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
          style={{
            position: "relative",
            display: "flex",
            minWidth: 0,
            flex: hasActiveCanvas ? "0 0 50%" : "1 1 0%",
            width: hasActiveCanvas ? "50%" : "100%",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
        >
          <div ref={state.chatScrollRef} className="orch-studio__feed">
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
            suggestions={dynamicSuggestions ?? []}
            onResetThread={state.handleNewSession}
          />
        </main>

        {/* Right Side: Dual-Pane Interactive Canvas Pane */}
        {hasActiveCanvas && (
          <section style={{ display: "flex", minWidth: 0, flex: 1, overflow: "hidden" }}>
            <CanvasPane />
          </section>
        )}

        {/* Right Side: Collapsible Inspector Rail */}
        {state.railOpen && !hasActiveCanvas && (
          <aside style={{ width: "20rem", flexShrink: 0, borderLeft: "1px solid var(--border)" }}>
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
