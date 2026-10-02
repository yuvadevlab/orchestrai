"use client";

/**
 * @file studio-prompt-action-row.tsx
 * @description Action controls row containing file attachment trigger, selectors, and Run/Stop button.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import type { SpecialistPersona } from "../types";
import type { LlmModelRecord, PlatformModeRecord } from "@orchestrai/shared-types";
import { StudioFileAttachment, type AttachedFile } from "./studio-file-attachment";
import { StudioPromptBarSelectors } from "./studio-prompt-bar-selectors";

export interface StudioPromptActionRowProps {
  readonly isRunning: boolean;
  readonly canSubmit: boolean;
  readonly onFileUploaded: (file: AttachedFile) => void;
  readonly onStop: () => void;
  readonly onSubmit: () => void;
  readonly specialists: SpecialistPersona[];
  readonly selectedSpecialistId: string;
  readonly onSelectSpecialist: (id: string) => void;
  readonly models?: readonly LlmModelRecord[];
  readonly selectedModel: string;
  readonly onSelectModel: (model: string) => void;
  readonly modes: readonly PlatformModeRecord[];
  readonly mode: string;
  readonly onSelectMode: (mode: string) => void;
}

/**
 * Bottom action control row for the Cowork prompt bar.
 */
export function StudioPromptActionRow({
  isRunning,
  canSubmit,
  onFileUploaded,
  onStop,
  onSubmit,
  specialists,
  selectedSpecialistId,
  onSelectSpecialist,
  models = [],
  selectedModel,
  onSelectModel,
  modes,
  mode,
  onSelectMode,
}: StudioPromptActionRowProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2 px-2 pt-1.5">
      <StudioFileAttachment onFileUploaded={onFileUploaded} disabled={isRunning} />

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
            onClick={onSubmit}
            disabled={!canSubmit}
            className="size-7 rounded-md"
            aria-label="Run"
          >
            <ArrowUp className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
