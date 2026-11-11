"use client";

/**
 * @file session-drawer-item.tsx
 * @description Single session item within the session drawer including three-dot actions menu.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import type { CoworkSession } from "../types";

export interface SessionDrawerItemProps {
  readonly session: CoworkSession;
  readonly isActive: boolean;
  readonly isMenuOpen: boolean;
  readonly onSelect: (id: string) => void;
  readonly onToggleMenu: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

/**
 * Single session item with metadata and action dropdown menu.
 */
export function SessionDrawerItem({
  session: s,
  isActive,
  isMenuOpen,
  onSelect,
  onToggleMenu,
  onDelete,
}: SessionDrawerItemProps): React.JSX.Element {
  const msgCount = s.messages.length;

  return (
    <div
      onClick={() => onSelect(s.id)}
      className={`orch-session-item ${isActive ? "is-active" : ""}`}
      style={{ position: "relative" }}
    >
      <div style={{ minWidth: 0, flex: 1, paddingRight: "0.5rem" }}>
        <p
          className="orch-truncate"
          style={{ margin: 0, fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.3 }}
        >
          {s.title}
        </p>
        <div
          className="orch-flex-row orch-gap-xs orch-text-muted orch-font-mono"
          style={{
            margin: 0,
            marginTop: "0.125rem",
            alignItems: "center",
            fontSize: "0.625rem",
          }}
        >
          <span>
            {msgCount} msg{msgCount === 1 ? "" : "s"}
          </span>
          <span>·</span>
          <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(s.id);
          }}
          style={{
            borderRadius: "var(--radius-sm, 0.25rem)",
            padding: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            opacity: isMenuOpen || isActive ? 1 : 0.6,
          }}
          title={UI_COPY.STUDIO.DRAWER.THREAD_OPTIONS_A11Y}
          aria-label={UI_COPY.STUDIO.DRAWER.THREAD_OPTIONS_A11Y}
        >
          <MoreHorizontal style={{ width: "0.875rem", height: "0.875rem" }} />
        </button>

        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "1.75rem",
              right: 0,
              zIndex: 50,
              minWidth: "7.5rem",
              borderRadius: "var(--radius-md, 0.375rem)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              padding: "0.25rem",
              fontSize: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <button
              type="button"
              onClick={() => onDelete(s.id)}
              className="orch-flex-row orch-gap-xs orch-text-destructive"
              style={{
                width: "100%",
                alignItems: "center",
                borderRadius: "var(--radius-sm, 0.25rem)",
                padding: "0.375rem 0.5rem",
                textAlign: "left",
                fontSize: "0.75rem",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
              <span>{UI_COPY.COMMON.ACTIONS.DELETE}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
