"use client";

/**
 * @file studio-mention-popover.tsx
 * @description Floating @ mention autocomplete popover for workspace files and cluster specialist personas.
 * @module apps/console/features/studio/components
 */

import React, { useEffect, useState } from "react";
import { FileCode, Bot, FileText, File } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import { useWorkspaceFiles } from "../api/use-workspace-files";
import type { SpecialistPersona } from "../types";

export interface MentionSelection {
  readonly type: "file" | "specialist";
  readonly label: string;
  readonly value: string;
  readonly extraId?: string;
}

export interface StudioMentionPopoverProps {
  readonly query: string;
  readonly workspacePath?: string;
  readonly specialists: readonly SpecialistPersona[];
  readonly onSelect: (selection: MentionSelection) => void;
  readonly onClose: () => void;
}

/**
 * Resolves a file icon based on file extension.
 */
function getFileIcon(ext: string): React.JSX.Element {
  if ([".ts", ".tsx", ".js", ".jsx", ".py", ".rs", ".go", ".c", ".cpp"].includes(ext)) {
    return (
      <FileCode
        style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0, color: "var(--primary)" }}
      />
    );
  }
  if ([".md", ".txt", ".json", ".yaml", ".yml", ".toml"].includes(ext)) {
    return (
      <FileText
        style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0, color: "var(--primary)" }}
      />
    );
  }
  return (
    <File
      className="orch-text-muted"
      style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
    />
  );
}

/**
 * Floating mention menu offering fuzzy completion for files and specialist agents.
 */
export function StudioMentionPopover({
  query,
  workspacePath,
  specialists,
  onSelect,
  onClose,
}: StudioMentionPopoverProps): React.JSX.Element | null {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: files = [] } = useWorkspaceFiles(workspacePath, query, true);

  // Filter specialists matching query
  const filteredSpecialists = specialists.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.domain.toLowerCase().includes(q)
    );
  });

  // Combine items: specialists first, then files
  const items: MentionSelection[] = [
    ...filteredSpecialists.map((s) => ({
      type: "specialist" as const,
      label: s.name,
      value: s.name,
      extraId: s.id,
    })),
    ...files.slice(0, 10).map((f) => ({
      type: "file" as const,
      label: f.path,
      value: f.path,
    })),
  ];

  // Reset or constrain selection index on item list change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, items.length]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (items.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (items[selectedIndex]) {
          e.preventDefault();
          onSelect(items[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [items, selectedIndex, onSelect, onClose]);

  if (items.length === 0) return null;

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
        <span>{UI_COPY.STUDIO.MENTIONS.HEADER_TITLE}</span>
        <span>{UI_COPY.STUDIO.MENTIONS.MATCHES_COUNT(items.length)}</span>
      </div>

      <div
        style={{ padding: "0.125rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}
      >
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={`${item.type}-${item.value}`}
              type="button"
              onClick={() => onSelect(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`orch-slash-item ${isSelected ? "is-selected" : ""}`}
            >
              {item.type === "specialist" ? (
                <Bot
                  className="orch-text-primary"
                  style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
                />
              ) : (
                getFileIcon(item.value.slice(item.value.lastIndexOf(".")))
              )}

              <div className="orch-truncate" style={{ minWidth: 0, flex: 1 }}>
                <span className="orch-font-mono">{item.label}</span>
              </div>

              <span
                className="orch-text-muted orch-font-mono"
                style={{ flexShrink: 0, fontSize: "0.625rem", textTransform: "uppercase" }}
              >
                {item.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
