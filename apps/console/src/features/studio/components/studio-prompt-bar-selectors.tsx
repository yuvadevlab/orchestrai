"use client";

/**
 * @file studio-prompt-bar-selectors.tsx
 * @description In-composer selector dropdowns for Specialist persona, LLM Model, and Platform Mode.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { Bot, Cpu, Sparkles } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@yuva-devlab/ui";
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
        <SelectTrigger className="border-border bg-background h-7 w-auto shrink-0 gap-1.5 rounded-md px-2.5 text-xs font-medium">
          <Bot className="text-primary size-3.5 shrink-0" />
          <SelectValue placeholder={UI_COPY.STUDIO.SELECT_SPECIALIST} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-foreground text-xs">
          {specialists && specialists.length > 0 ? (
            specialists.map((sp) => (
              <SelectItem key={sp.id} value={sp.id} className="cursor-pointer text-xs">
                {sp.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled className="text-muted-foreground text-xs">
              {UI_COPY.STUDIO.LOADING_AGENTS}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Live Database Model Selector */}
      <Select value={selectedModel} onValueChange={onSelectModel}>
        <SelectTrigger className="border-border bg-background h-7 w-auto shrink-0 gap-1.5 rounded-md px-2.5 text-xs font-medium">
          <Cpu className="text-muted-foreground size-3.5 shrink-0" />
          <SelectValue placeholder={UI_COPY.STUDIO.SELECT_MODEL} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-foreground text-xs">
          {models && models.length > 0 ? (
            models.map((m) => (
              <SelectItem
                key={m.modelId || m.modelIdentifier}
                value={m.modelIdentifier || m.name}
                className="cursor-pointer text-xs"
              >
                {m.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled className="text-muted-foreground text-xs">
              {UI_COPY.STUDIO.LOADING_MODELS}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Platform Mode Selector Dropdown */}
      <Select value={mode} onValueChange={onSelectMode}>
        <SelectTrigger className="border-border bg-background h-7 w-auto shrink-0 gap-1.5 rounded-md px-2.5 text-xs font-medium capitalize">
          <Sparkles className="text-warning size-3.5 shrink-0" />
          <SelectValue placeholder={UI_COPY.STUDIO.SELECT_MODE} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-foreground text-xs">
          {modes && modes.length > 0 ? (
            modes.map((m) => (
              <SelectItem
                key={m.modeId || m.slug}
                value={m.slug}
                className="cursor-pointer text-xs capitalize"
              >
                {m.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled className="text-muted-foreground text-xs">
              {UI_COPY.STUDIO.LOADING_MODES}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </>
  );
}
