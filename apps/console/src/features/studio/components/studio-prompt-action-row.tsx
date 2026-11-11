"use client";

/**
 * @file studio-prompt-action-row.tsx
 * @description Action controls row containing file attachment trigger, selectors, and Run/Stop button.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@orchestrai/ui";
import type { SpecialistPersona } from "../types";
import type { LlmModelRecord, PlatformModeRecord } from "@orchestrai/shared-types";
import { StudioFileAttachment, type AttachedFile } from "./studio-file-attachment";
import { StudioPromptBarSelectors } from "./studio-prompt-bar-selectors";
import { UI_COPY } from "@/lib/ui-copy";

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
    <div
      className="orch-flex-row orch-gap-xs"
      style={{ flexWrap: "wrap", alignItems: "center", padding: "0.375rem 0.5rem 0" }}
    >
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

      <div style={{ marginLeft: "auto" }}>
        {isRunning ? (
          <Button
            variant="destructive"
            size="icon"
            onClick={onStop}
            style={{
              width: "1.75rem",
              height: "1.75rem",
              borderRadius: "var(--radius-md, 0.375rem)",
            }}
            aria-label={UI_COPY.STUDIO.PROMPT.STOP_A11Y}
          >
            <Square style={{ width: "0.75rem", height: "0.75rem", fill: "currentColor" }} />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              width: "1.75rem",
              height: "1.75rem",
              borderRadius: "var(--radius-md, 0.375rem)",
            }}
            aria-label={UI_COPY.STUDIO.PROMPT.RUN_A11Y}
          >
            <ArrowUp style={{ width: "0.875rem", height: "0.875rem" }} />
          </Button>
        )}
      </div>
    </div>
  );
}
