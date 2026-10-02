"use client";

/**
 * @file studio-mention-popover.tsx
 * @description Floating @ mention autocomplete popover for workspace files and cluster specialist personas.
 * @module apps/console/features/studio/components
 */

import React, { useEffect, useState } from "react";
import { FileCode, Bot, FileText, File } from "lucide-react";
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
    return <FileCode className="size-3.5 shrink-0 text-blue-400" />;
  }
  if ([".md", ".txt", ".json", ".yaml", ".yml", ".toml"].includes(ext)) {
    return <FileText className="size-3.5 shrink-0 text-amber-400" />;
  }
  return <File className="text-muted-foreground size-3.5 shrink-0" />;
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
    <div className="border-border bg-card/95 text-card-foreground animate-in fade-in-50 slide-in-from-bottom-2 absolute bottom-full left-4 z-50 mb-2 max-h-64 w-80 overflow-y-auto rounded-md border p-1 shadow-2xl backdrop-blur-md">
      <div className="border-border/60 text-muted-foreground flex items-center justify-between border-b px-2 py-1 font-mono text-[10px] uppercase">
        <span>Mentions (@)</span>
        <span>{items.length} matches</span>
      </div>

      <div className="space-y-0.5 p-0.5">
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={`${item.type}-${item.value}`}
              type="button"
              onClick={() => onSelect(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                isSelected
                  ? "bg-primary/15 text-primary font-medium"
                  : "hover:bg-muted/60 text-foreground"
              }`}
            >
              {item.type === "specialist" ? (
                <Bot className="text-primary size-3.5 shrink-0" />
              ) : (
                getFileIcon(item.value.slice(item.value.lastIndexOf(".")))
              )}

              <div className="min-w-0 flex-1 truncate">
                <span className="font-mono">{item.label}</span>
              </div>

              <span className="text-muted-foreground shrink-0 font-mono text-[10px] uppercase">
                {item.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
