"use client";

/**
 * @file session-drawer.tsx
 * @description Threaded session history sidebar with search, three-dot action menus, and clean typography.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { MessageSquare, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react";
import { Badge, Button } from "@yuva-devlab/ui";
import type { CoworkSession } from "../types";

export interface SessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: CoworkSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

/**
 * Clean, modern sidebar listing all saved cowork session threads with three-dot action menus.
 */
export function SessionDrawer({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionDrawerProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [menuSessionId, setMenuSessionId] = useState<string | null>(null);

  if (!isOpen) return <></>;

  const filtered = sessions.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className="border-border bg-sidebar/80 flex h-full w-72 shrink-0 flex-col border-r backdrop-blur-md transition-all duration-200">
      {/* Header */}
      <div className="border-border/60 flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-primary size-4" />
          <span className="text-foreground text-sm font-semibold">Threads</span>
          <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
            {sessions.length}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground size-7 rounded-md p-0"
          title="Close sidebar"
          aria-label="Close session threads"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Action Bar: New Thread & Search */}
      <div className="border-border/40 space-y-2 border-b p-3">
        <Button
          onClick={onNewSession}
          className="h-8.5 w-full gap-1.5 text-xs font-semibold shadow-xs"
          size="sm"
        >
          <Plus className="size-3.5" />
          <span>New Thread</span>
        </Button>

        <div className="border-border bg-background/80 flex h-8.5 items-center gap-2 rounded-md border px-3 text-xs shadow-2xs">
          <Search className="text-muted-foreground size-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="placeholder:text-muted-foreground w-full bg-transparent text-xs outline-none"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground/70 space-y-1 py-10 text-center text-xs">
            <p className="font-medium">
              {search ? "No matching threads." : "No saved threads yet."}
            </p>
            {!search && (
              <p className="text-muted-foreground/50 text-[11px]">
                Send a message in the studio to start a thread.
              </p>
            )}
          </div>
        ) : (
          filtered.map((s) => {
            const isActive = s.id === activeSessionId;
            const isMenuOpen = menuSessionId === s.id;
            const msgCount = s.messages.length;

            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSession(s.id);
                  setMenuSessionId(null);
                }}
                className={`group relative flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20 border font-medium"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {/* Title & Metadata with Text Ellipsis */}
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-foreground truncate text-xs leading-snug font-medium">
                    {s.title}
                  </p>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 font-mono text-[10px]">
                    <span>
                      {msgCount} msg{msgCount === 1 ? "" : "s"}
                    </span>
                    <span>·</span>
                    <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Three-dots Action Button on Hover */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuSessionId(isMenuOpen ? null : s.id);
                    }}
                    className={`hover:text-foreground hover:bg-muted/80 rounded-md p-1 transition-all ${
                      isMenuOpen || isActive
                        ? "text-foreground opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    title="Thread options"
                    aria-label="Thread options"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>

                  {/* Dropdown Action Popover */}
                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="border-border bg-popover text-popover-foreground absolute top-7 right-0 z-50 min-w-30 rounded-md border p-1 text-xs shadow-lg backdrop-blur-md"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteSession(s.id);
                          setMenuSessionId(null);
                        }}
                        className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
