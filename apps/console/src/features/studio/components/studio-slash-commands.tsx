"use client";

/**
 * @file studio-slash-commands.tsx
 * @description Floating slash commands palette matching Claude Cowork and ChatGPT Canvas workflows.
 * @module apps/console/features/studio/components
 */

import React, { useEffect, useState } from "react";
import { STUDIO_SLASH_COMMANDS, type SlashCommandItem } from "./studio-slash-commands.types";

export * from "./studio-slash-commands.types";

export interface StudioSlashCommandsProps {
  readonly query: string;
  readonly onSelect: (command: SlashCommandItem) => void;
  readonly onClose: () => void;
}

/**
 * Renders floating slash command popup above the prompt bar.
 */
export function StudioSlashCommands({
  query,
  onSelect,
  onClose,
}: StudioSlashCommandsProps): React.JSX.Element | null {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cleanQuery = query.startsWith("/")
    ? query.slice(1).toLowerCase().trim()
    : query.toLowerCase().trim();
  const filtered = STUDIO_SLASH_COMMANDS.filter(
    (c) =>
      c.command.toLowerCase().includes(cleanQuery) ||
      c.title.toLowerCase().includes(cleanQuery) ||
      c.description.toLowerCase().includes(cleanQuery),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery, filtered.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (filtered[selectedIndex]) {
          e.preventDefault();
          onSelect(filtered[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div className="border-border bg-card/95 text-card-foreground animate-in fade-in-50 slide-in-from-bottom-2 absolute bottom-full left-4 z-50 mb-2 max-h-72 w-80 overflow-y-auto rounded-md border p-1 shadow-2xl backdrop-blur-md">
      <div className="border-border/60 text-muted-foreground flex items-center justify-between border-b px-2 py-1 font-mono text-[10px] uppercase">
        <span>Commands (/)</span>
        <span>{filtered.length} available</span>
      </div>

      <div className="space-y-0.5 p-0.5">
        {filtered.map((cmd, idx) => {
          const isSelected = idx === selectedIndex;
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              type="button"
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-xs transition-colors ${
                isSelected
                  ? "bg-primary/15 text-primary font-medium"
                  : "hover:bg-muted/60 text-foreground"
              }`}
            >
              <Icon className="text-primary size-4 shrink-0 opacity-80" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold">{cmd.command}</span>
                  <span className="text-muted-foreground text-[11px]">• {cmd.title}</span>
                </div>
                <div className="text-muted-foreground truncate text-[10px]">{cmd.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
