"use client";

/**
 * @file studio-prompt-bar-selectors.tsx
 * @description In-composer selector dropdowns for Specialist persona, LLM Model, and Platform Mode.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { Bot, Cpu, Sparkles } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { SpecialistPersona } from "../types";
import type { LlmModelRecord, PlatformModeRecord } from "@orchestrai/shared-types";

export interface StudioPromptBarSelectorsProps {
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
 * Specialized toolbar selector controls for model, specialist, and system mode.
 */
export function StudioPromptBarSelectors({
  specialists,
  selectedSpecialistId,
  onSelectSpecialist,
  models = [],
  selectedModel,
  onSelectModel,
  modes = [],
  mode,
  onSelectMode,
}: StudioPromptBarSelectorsProps): React.JSX.Element {
  return (
    <>
      {/* Specialist Selector */}
      <Select value={selectedSpecialistId} onValueChange={onSelectSpecialist}>
        <SelectTrigger
          style={{
            height: "1.75rem",
            width: "auto",
            flexShrink: 0,
            gap: "0.375rem",
            padding: "0 0.625rem",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          <Bot
            className="orch-text-primary"
            style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
          />
          <SelectValue placeholder={UI_COPY.STUDIO.SELECT_SPECIALIST} />
        </SelectTrigger>
        <SelectContent>
          {specialists && specialists.length > 0 ? (
            specialists.map((sp) => (
              <SelectItem
                key={sp.id}
                value={sp.id}
                style={{ cursor: "pointer", fontSize: "0.75rem" }}
              >
                {sp.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem
              value="loading"
              disabled
              className="orch-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              {UI_COPY.STUDIO.LOADING_AGENTS}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Live Database Model Selector */}
      <Select value={selectedModel} onValueChange={onSelectModel}>
        <SelectTrigger
          style={{
            height: "1.75rem",
            width: "auto",
            flexShrink: 0,
            gap: "0.375rem",
            padding: "0 0.625rem",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          <Cpu
            className="orch-text-muted"
            style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
          />
          <SelectValue placeholder={UI_COPY.STUDIO.SELECT_MODEL} />
        </SelectTrigger>
        <SelectContent>
          {models && models.length > 0 ? (
            models.map((m) => (
              <SelectItem
                key={m.modelId || m.modelIdentifier}
                value={m.modelIdentifier || m.name}
                style={{ cursor: "pointer", fontSize: "0.75rem" }}
              >
                {m.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem
              value="loading"
              disabled
              className="orch-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              {UI_COPY.STUDIO.LOADING_MODELS}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Platform Mode Selector Dropdown */}
      <Select value={mode} onValueChange={onSelectMode}>
        <SelectTrigger
          style={{
            height: "1.75rem",
            width: "auto",
            flexShrink: 0,
            gap: "0.375rem",
            padding: "0 0.625rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          <Sparkles
            className="orch-text-primary"
            style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
          />
          <SelectValue placeholder={UI_COPY.STUDIO.SELECT_MODE} />
        </SelectTrigger>
        <SelectContent>
          {modes && modes.length > 0 ? (
            modes.map((m) => (
              <SelectItem
                key={m.modeId || m.slug}
                value={m.slug}
                style={{ cursor: "pointer", fontSize: "0.75rem", textTransform: "capitalize" }}
              >
                {m.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem
              value="loading"
              disabled
              className="orch-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              {UI_COPY.STUDIO.LOADING_MODES}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </>
  );
}
