"use client";

/**
 * @file studio-prompt-bar.tsx
 * @description Floating bottom prompt input bar for universal cowork and task dispatching.
 * @module apps/console/features/studio/components
 */

import React, { useRef, useEffect } from "react";
import { ArrowUp, Bot, Cpu, Sparkles, Square } from "lucide-react";
import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@yuva-devlab/ui";
import type { SpecialistPersona } from "../types";
import type { LlmModelRecord, PlatformModeRecord } from "@orchestrai/shared-types";

export interface StudioPromptBarProps {
  prompt: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
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
}

/**
 * Floating bottom command station for the Cowork Studio.
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
}: StudioPromptBarProps): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types while preserving spacious multi-line composer height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(84, Math.min(textareaRef.current.scrollHeight, 220))}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isRunning && prompt.trim()) {
        onSubmit();
      }
    }
  };

  const availableModes =
    modes.length > 0
      ? modes
      : [
          { modeId: "auto", slug: "auto", name: "Auto", description: "Autonomous swarm" },
          { modeId: "chat", slug: "chat", name: "Chat", description: "Direct dialogue" },
          { modeId: "plan", slug: "plan", name: "Plan", description: "Decompose objective" },
          { modeId: "act", slug: "act", name: "Act", description: "Execute tools" },
        ];

  return (
    <div className="relative z-20 mx-auto w-full max-w-4xl px-4 pb-4">
      {/* Quick Suggestion Pills (if provided dynamically) */}
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
          {/* Specialist Selector */}
          <Select value={selectedSpecialistId} onValueChange={onSelectSpecialist}>
            <SelectTrigger className="border-border bg-background h-7 w-auto shrink-0 gap-1.5 rounded-md px-2.5 text-xs font-medium">
              <Bot className="text-primary size-3.5 shrink-0" />
              <SelectValue placeholder="Select specialist" />
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
                  Loading agents...
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Live Database Model Selector */}
          <Select value={selectedModel} onValueChange={onSelectModel}>
            <SelectTrigger className="border-border bg-background h-7 w-auto shrink-0 gap-1.5 rounded-md px-2.5 text-xs font-medium">
              <Cpu className="text-muted-foreground size-3.5 shrink-0" />
              <SelectValue placeholder="Select model engine" />
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
                  Loading models...
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Platform Mode Selector Dropdown */}
          <Select value={mode} onValueChange={onSelectMode}>
            <SelectTrigger className="border-border bg-background h-7 w-auto shrink-0 gap-1.5 rounded-md px-2.5 text-xs font-medium capitalize">
              <Sparkles className="size-3.5 shrink-0 text-amber-400" />
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground text-xs">
              {availableModes.map((m) => (
                <SelectItem
                  key={m.modeId || m.slug}
                  value={m.slug}
                  className="cursor-pointer text-xs capitalize"
                >
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                onClick={onSubmit}
                disabled={!prompt.trim()}
                className="size-7 rounded-md"
                aria-label="Run"
              >
                <ArrowUp className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
