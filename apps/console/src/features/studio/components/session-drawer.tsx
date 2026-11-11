"use client";

/**
 * @file session-drawer.tsx
 * @description Threaded session history sidebar with search, three-dot action menus, and clean typography.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { MessageSquare, Plus, Search, X } from "lucide-react";
import { Badge, Button } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { CoworkSession } from "../types";
import { SessionDrawerItem } from "./session-drawer-item";

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
    <aside
      style={{
        display: "flex",
        height: "100%",
        width: "18rem",
        flexShrink: 0,
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        backgroundColor: "color-mix(in oklab, var(--sidebar) 80%, transparent)",
        backdropFilter: "blur(12px)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        className="orch-flex-row orch-justify-between"
        style={{
          height: "3.5rem",
          flexShrink: 0,
          alignItems: "center",
          borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
          padding: "0 1rem",
        }}
      >
        <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
          <MessageSquare className="orch-text-primary" style={{ width: "1rem", height: "1rem" }} />
          <span className="orch-font-semibold" style={{ fontSize: "0.875rem" }}>
            {UI_COPY.STUDIO.DRAWER.THREADS_LABEL}
          </span>
          <Badge
            variant="secondary"
            className="orch-font-mono"
            style={{ padding: "0 0.375rem", fontSize: "0.625rem" }}
          >
            {sessions.length}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="orch-text-muted"
          style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
          title={UI_COPY.STUDIO.DRAWER.CLOSE_TOOLTIP}
          aria-label={UI_COPY.STUDIO.DRAWER.CLOSE_A11Y}
        >
          <X style={{ width: "1rem", height: "1rem" }} />
        </Button>
      </div>

      {/* Action Bar: New Thread & Search */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          borderBottom: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
          padding: "0.75rem",
        }}
      >
        <Button
          onClick={onNewSession}
          className="orch-flex-row orch-gap-xs"
          style={{
            height: "2.125rem",
            width: "100%",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
          size="sm"
        >
          <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>{UI_COPY.STUDIO.DRAWER.NEW_THREAD}</span>
        </Button>

        <div
          className="orch-flex-row orch-gap-xs"
          style={{
            height: "2.125rem",
            alignItems: "center",
            borderRadius: "var(--radius-md, 0.375rem)",
            border: "1px solid var(--border)",
            backgroundColor: "color-mix(in oklab, var(--background) 80%, transparent)",
            padding: "0 0.75rem",
            fontSize: "0.75rem",
          }}
        >
          <Search
            className="orch-text-muted"
            style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder={UI_COPY.STUDIO.DRAWER.SEARCH_PLACEHOLDER}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              fontSize: "0.75rem",
              outline: "none",
              color: "inherit",
            }}
          />
        </div>
      </div>

      {/* Thread List */}
      <div
        style={{
          flex: "1 1 0%",
          overflowY: "auto",
          padding: "0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        {filtered.length === 0 ? (
          <div
            className="orch-text-muted"
            style={{ padding: "2.5rem 0", textAlign: "center", fontSize: "0.75rem" }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>
              {search
                ? UI_COPY.STUDIO.DRAWER.NO_MATCHING_THREADS
                : UI_COPY.STUDIO.DRAWER.NO_SAVED_THREADS}
            </p>
            {!search && (
              <p style={{ margin: 0, marginTop: "0.25rem", fontSize: "0.6875rem", opacity: 0.5 }}>
                {UI_COPY.STUDIO.DRAWER.START_THREAD_HINT}
              </p>
            )}
          </div>
        ) : (
          filtered.map((s) => (
            <SessionDrawerItem
              key={s.id}
              session={s}
              isActive={s.id === activeSessionId}
              isMenuOpen={menuSessionId === s.id}
              onSelect={(id) => {
                onSelectSession(id);
                setMenuSessionId(null);
              }}
              onToggleMenu={(id) => {
                setMenuSessionId(menuSessionId === id ? null : id);
              }}
              onDelete={(id) => {
                onDeleteSession(id);
                setMenuSessionId(null);
              }}
            />
          ))
        )}
      </div>
    </aside>
  );
}
