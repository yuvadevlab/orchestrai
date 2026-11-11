import React from "react";
import { Switch } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { ToolDefinition } from "../types";

/**
 * Formats a raw database permission level into a clean autonomy policy label.
 *
 * @param permissionLevel - Raw database permission level string
 * @returns Human-friendly permission policy label
 */
function formatPermissionLabel(permissionLevel?: string): string {
  if (!permissionLevel) return UI_COPY.TOOLS.CARD.POLICY_AUTO_RUN;
  const normalized = permissionLevel.toLowerCase().trim();

  // Read-only operations can execute autonomously without interruption
  if (normalized === "read_only" || normalized === "auto_run" || normalized === "auto-run") {
    return UI_COPY.TOOLS.CARD.POLICY_AUTO_RUN;
  }

  // Mutating or sensitive actions require explicit human operator confirmation
  if (
    normalized === "write_safe" ||
    normalized === "sensitive" ||
    normalized === "dangerous" ||
    normalized === "ask_first" ||
    normalized === "ask first"
  ) {
    return UI_COPY.TOOLS.CARD.POLICY_ASK_FIRST;
  }

  return permissionLevel;
}

/**
 * Formats a raw database sandbox identifier into a human-readable containment label.
 *
 * @param sandbox - Explicit sandbox identifier from tool record
 * @param category - Category fallback if sandbox is unspecified
 * @returns Clean sandbox isolation label
 */
function formatSandboxLabel(sandbox?: string, category?: string): string {
  if (sandbox) {
    const s = sandbox.toLowerCase().trim();
    if (s === "network_read" || s === "network read")
      return UI_COPY.TOOLS.CARD.SANDBOX_NETWORK_READ;
    if (s === "read_only" || s === "read only") return UI_COPY.TOOLS.CARD.SANDBOX_READ_ONLY;
    if (s === "workspace_write" || s === "workspace write")
      return UI_COPY.TOOLS.CARD.SANDBOX_WORKSPACE_WRITE;
    if (s === "ephemeral_vm" || s === "ephemeral vm")
      return UI_COPY.TOOLS.CARD.SANDBOX_EPHEMERAL_VM;
    if (s === "network_write" || s === "network write")
      return UI_COPY.TOOLS.CARD.SANDBOX_NETWORK_WRITE;
    return sandbox;
  }

  // Derive contextual sandbox from category if sandbox field is empty
  const cat = (category ?? "").toLowerCase();
  if (cat.includes("web") || cat.includes("search")) return UI_COPY.TOOLS.CARD.SANDBOX_NETWORK_READ;
  if (cat.includes("file") || cat.includes("workspace"))
    return UI_COPY.TOOLS.CARD.SANDBOX_WORKSPACE_WRITE;
  if (cat.includes("computation") || cat.includes("api"))
    return UI_COPY.TOOLS.CARD.SANDBOX_EPHEMERAL_VM;
  return UI_COPY.TOOLS.CARD.SANDBOX_READ_ONLY;
}

/**
 * Props for ToolCard component.
 */
export interface ToolCardProps {
  /** Tool definition model from database */
  readonly tool: ToolDefinition;
  /** Callback invoked when tool enablement switch is toggled */
  readonly onToggle?: (checked: boolean) => void;
  /** Whether toggle mutation is currently in-flight */
  readonly isPending?: boolean;
}

/**
 * Visual card displaying a tool definition with toggle switch, description,
 * permission policy pill, and sandboxed containment badge.
 * Matches the official orchestrai-src aesthetic with zero hardcoded metrics.
 */
export function ToolCard({ tool, onToggle, isPending = false }: ToolCardProps): React.JSX.Element {
  const isEnabled = tool.isEnabled ?? true;
  const permLabel = formatPermissionLabel(tool.permissionLevel);
  const sandboxLabel = formatSandboxLabel(tool.sandbox, tool.category);

  return (
    <div className="orch-tool-card">
      <div>
        <div className="orch-tool-header">
          <div className="orch-tool-title">{tool.name}</div>
          <Switch
            checked={isEnabled}
            disabled={isPending}
            onCheckedChange={(checked) => {
              // Dispatch toggle handler to synchronize with live database
              onToggle?.(checked);
            }}
            aria-label={UI_COPY.TOOLS.CARD.TOGGLE_A11Y(tool.name)}
          />
        </div>
        <p className="orch-tool-desc">
          {tool.description || UI_COPY.TOOLS.CARD.DEFAULT_DESCRIPTION}
        </p>
      </div>

      <div
        style={{
          marginTop: "0.875rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.75rem",
        }}
      >
        <span
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--secondaryForeground)",
            borderRadius: "var(--radius-md, 0.375rem)",
            paddingInline: "0.5rem",
            paddingBlock: "0.125rem",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {permLabel}
        </span>
        <span
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--secondaryForeground)",
            borderRadius: "var(--radius-md, 0.375rem)",
            paddingInline: "0.5rem",
            paddingBlock: "0.125rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
          }}
        >
          {sandboxLabel}
        </span>
      </div>
    </div>
  );
}
