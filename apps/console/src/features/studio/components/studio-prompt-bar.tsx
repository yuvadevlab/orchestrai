"use client";

/**
 * @file studio-prompt-bar.tsx
 * @description Floating bottom prompt input bar for universal cowork and task dispatching.
 * @module apps/console/features/studio/components
 */

import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import type { SpecialistPersona, StudioApprovalRequest } from "../types";
import {
  PermissionScope,
  type LlmModelRecord,
  type PlatformModeRecord,
} from "@orchestrai/shared-types";
import {
  StudioFileAttachment,
  StudioAttachedFilesList,
  type AttachedFile,
} from "./studio-file-attachment";
import { StudioPromptBarSelectors } from "./studio-prompt-bar-selectors";
import { StudioLiveClearanceCard } from "./studio-live-clearance-card";

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
}

/**
 * Floating bottom command station for the Cowork Studio with ChatGPT-style file attachments.
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
}: StudioPromptBarProps): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

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
          {/* Quick Suggestion Pills */}
          {!isRunning && suggestions && suggestions.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange(s)}
                  className="border-border/60 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Uploaded Documents Pills */}
          <StudioAttachedFilesList files={attachedFiles} onRemove={handleFileRemoved} />

          {/* Floating Prompt Container */}
          <div className="border-border bg-card/85 relative rounded-md border p-2 shadow-lg backdrop-blur-md">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe any objective — research, write, build, analyze…"
              rows={3}
              disabled={isRunning}
              className="placeholder:text-muted-foreground max-h-56 min-h-21 w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed outline-none disabled:opacity-50"
            />

            {/* Action Controls Bar */}
            <div className="flex flex-wrap items-center gap-2 px-2 pt-1.5">
              {/* ChatGPT-style '+' file upload trigger */}
              <StudioFileAttachment onFileUploaded={handleFileUploaded} disabled={isRunning} />

              {/* Persona, Model, and Mode Selectors */}
              <StudioPromptBarSelectors
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

              {/* Run / Stop */}
              <div className="ml-auto">
                {isRunning ? (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={onStop}
                    className="size-7 rounded-md"
                    aria-label="Stop execution"
                  >
                    <Square className="size-3 fill-current" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleDispatch}
                    disabled={!prompt.trim() && attachedFiles.length === 0}
                    className="size-7 rounded-md"
                    aria-label="Run"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
