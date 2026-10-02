"use client";

/**
 * @file studio-prompt-bar.tsx
 * @description Floating bottom prompt input bar with @ file/specialist mentions and / slash commands.
 * @module apps/console/features/studio/components
 */

import React, { useRef, useEffect, useState } from "react";
import type { SpecialistPersona, StudioApprovalRequest } from "../types";
import {
  PermissionScope,
  type LlmModelRecord,
  type PlatformModeRecord,
} from "@orchestrai/shared-types";
import { useConsoleStore } from "@/lib/stores";
import { StudioAttachedFilesList, type AttachedFile } from "./studio-file-attachment";
import { StudioLiveClearanceCard } from "./studio-live-clearance-card";
import { StudioPromptSuggestions } from "./studio-prompt-suggestions";
import { StudioPromptActionRow } from "./studio-prompt-action-row";
import { StudioMentionPopover } from "./studio-mention-popover";
import { StudioSlashCommands } from "./studio-slash-commands";
import { usePromptCommands } from "../hooks/use-prompt-commands";

export interface StudioPromptBarProps {
  prompt: string;
  onChange: (val: string) => void;
  onSubmit: (overridePrompt?: string) => void;
  onStop: () => void;
  isRunning: boolean;
  /** Specialist personas for the in-composer selector. */
  specialists: SpecialistPersona[];
  selectedSpecialistId: string;
  onSelectSpecialist: (id: string) => void;
  /** Live DB models for the in-composer selector. */
  models?: readonly LlmModelRecord[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  /** Live DB platform modes for the in-composer segmented toggle. */
  modes: readonly PlatformModeRecord[];
  mode: string;
  onSelectMode: (mode: string) => void;
  suggestions?: readonly string[];
  /** Pending clearance ticket to prompt user for authorization */
  pendingApproval?: StudioApprovalRequest | null;
  /** Handler to resolve pending authorization */
  onResolveApproval?: (approvalId: string, scope: PermissionScope) => Promise<void>;
  /** Callback after resolution to update the message audit log in the stream */
  onApprovalResolved?: (approvalId: string, scope: PermissionScope, resolvedAt: string) => void;
  onResetThread?: () => void;
}

/**
 * Floating bottom command station for the Cowork Studio with file attachments, @ mentions, and / slash commands.
 */
export function StudioPromptBar({
  prompt,
  onChange,
  onSubmit,
  onStop,
  isRunning,
  specialists,
  selectedSpecialistId,
  onSelectSpecialist,
  models = [],
  selectedModel,
  onSelectModel,
  modes,
  mode,
  onSelectMode,
  suggestions = [],
  pendingApproval,
  onResolveApproval,
  onApprovalResolved,
  onResetThread,
}: StudioPromptBarProps): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const activeWorkspace = useConsoleStore((s) => s.activeWorkspace);

  const {
    mentionQuery,
    slashQuery,
    handleSelectMention,
    handleSelectSlashCommand,
    closeMention,
    closeSlash,
  } = usePromptCommands({
    prompt,
    onChange,
    onSelectMode,
    onSelectSpecialist,
    onResetThread,
  });

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(84, Math.min(textareaRef.current.scrollHeight, 220))}px`;
    }
  }, [prompt]);

  const handleFileUploaded = (file: AttachedFile): void => {
    setAttachedFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === file.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = file;
        return next;
      }
      return [...prev, file];
    });
  };

  const handleFileRemoved = (id: string): void => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDispatch = (): void => {
    if (!prompt.trim() && attachedFiles.length === 0) return;
    let finalPrompt = prompt.trim();
    const indexed = attachedFiles.filter((f) => f.status === "indexed");
    if (indexed.length > 0) {
      const docRefs = indexed
        .map((f) => `[Referenced document indexed in Knowledge: "${f.name}"]`)
        .join("\n");
      finalPrompt = finalPrompt ? `${finalPrompt}\n\n${docRefs}` : docRefs;
    }
    setAttachedFiles([]);
    onSubmit(finalPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Don't submit if mention or slash popups are active (they consume Enter)
      if (mentionQuery !== null || slashQuery !== null) return;
      e.preventDefault();
      if (!isRunning && (prompt.trim() || attachedFiles.length > 0)) {
        handleDispatch();
      }
    }
  };

  return (
    <div className="relative z-20 mx-auto w-full max-w-4xl px-4 pb-4">
      {/*
       * When human authorization is required, the prompt container is taken over
       * by the clearance action card (matching Claude Cowork, Copilot, and Antigravity).
       * Disappears immediately upon decision; decision notes render in the chat stream.
       */}
      {pendingApproval && onResolveApproval ? (
        <StudioLiveClearanceCard
          pendingApproval={pendingApproval}
          onResolve={onResolveApproval}
          onResolved={onApprovalResolved}
        />
      ) : (
        <>
          <StudioPromptSuggestions
            suggestions={suggestions}
            onSelect={onChange}
            isRunning={isRunning}
          />
          <StudioAttachedFilesList files={attachedFiles} onRemove={handleFileRemoved} />

          {/* Floating Prompt Container */}
          <div className="border-border bg-card/85 relative rounded-md border p-2 shadow-lg backdrop-blur-md">
            {/* Slash commands popover */}
            {slashQuery !== null && (
              <StudioSlashCommands
                query={slashQuery}
                onSelect={handleSelectSlashCommand}
                onClose={closeSlash}
              />
            )}

            {/* @ Mention popover for files and specialists */}
            {mentionQuery !== null && (
              <StudioMentionPopover
                query={mentionQuery}
                workspacePath={activeWorkspace?.path}
                specialists={specialists}
                onSelect={handleSelectMention}
                onClose={closeMention}
              />
            )}

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe any objective — use @ to mention files/specialists, / for commands…"
              rows={3}
              disabled={isRunning}
              className="placeholder:text-muted-foreground max-h-56 min-h-21 w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed outline-none disabled:opacity-50"
            />

            <StudioPromptActionRow
              isRunning={isRunning}
              canSubmit={Boolean(prompt.trim() || attachedFiles.length > 0)}
              onFileUploaded={handleFileUploaded}
              onStop={onStop}
              onSubmit={handleDispatch}
              specialists={specialists}
              selectedSpecialistId={selectedSpecialistId}
              onSelectSpecialist={onSelectSpecialist}
              models={models}
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              modes={modes}
              mode={mode}
              onSelectMode={onSelectMode}
            />
          </div>
        </>
      )}
    </div>
  );
}
