"use client";

/**
 * @file studio-slash-commands.tsx
 * @description Floating slash commands palette matching Claude Cowork and ChatGPT Canvas workflows.
 * @module apps/console/features/studio/components
 */

import React, { useEffect, useState, useMemo } from "react";
import {
  type SlashCommandItem,
  mapPlatformRecordToSlashCommand,
} from "./studio-slash-commands.types";
import { usePlatformCommands } from "../api";
import { UI_COPY } from "@/lib/ui-copy";

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

  // Fetch commands
  const { data: serverCommands } = usePlatformCommands();

  // Resolve active commands list
  const commands = useMemo<readonly SlashCommandItem[]>(() => {
    if (!serverCommands || serverCommands.length === 0) {
      return [];
    }
    return serverCommands.map(mapPlatformRecordToSlashCommand);
  }, [serverCommands]);

  const cleanQuery = query.startsWith("/")
    ? query.slice(1).toLowerCase().trim()
    : query.toLowerCase().trim();

  // Filter commands matching current input query
  const filtered = useMemo(() => {
    return commands.filter(
      (c) =>
        c.command.toLowerCase().includes(cleanQuery) ||
        c.title.toLowerCase().includes(cleanQuery) ||
        c.description.toLowerCase().includes(cleanQuery),
    );
  }, [commands, cleanQuery]);

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

  // If no commands match the query, do not render popup
  if (filtered.length === 0) return null;

  return (
    <div className="orch-slash-menu">
      <div
        className="orch-flex-row orch-justify-between orch-text-muted orch-font-mono"
        style={{
          borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          padding: "0.25rem 0.5rem",
          fontSize: "0.625rem",
          textTransform: "uppercase",
        }}
      >
        <span>{UI_COPY.STUDIO.COMMANDS.HEADER_TITLE}</span>
        <span>{UI_COPY.STUDIO.COMMANDS.AVAILABLE_COUNT(filtered.length)}</span>
      </div>

      <div
        style={{ padding: "0.125rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}
      >
        {filtered.map((cmd, idx) => {
          const isSelected = idx === selectedIndex;
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              type="button"
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`orch-slash-item ${isSelected ? "is-selected" : ""}`}
            >
              <Icon
                className="orch-text-primary"
                style={{ width: "1rem", height: "1rem", flexShrink: 0, opacity: 0.8 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
                  <span className="orch-font-mono orch-font-semibold">{cmd.command}</span>
                  <span className="orch-text-muted" style={{ fontSize: "0.6875rem" }}>
                    • {cmd.title}
                  </span>
                </div>
                <div className="orch-text-muted orch-truncate" style={{ fontSize: "0.625rem" }}>
                  {cmd.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
