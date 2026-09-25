import React from "react";
import { Switch } from "@yuva-devlab/ui";
import type { ToolDefinition } from "../types";

/**
 * Formats a raw database permission level into a clean autonomy policy label.
 *
 * @param permissionLevel - Raw database permission level string
 * @returns Human-friendly permission policy label
 */
function formatPermissionLabel(permissionLevel?: string): string {
  if (!permissionLevel) return "Auto-run";
  const normalized = permissionLevel.toLowerCase().trim();

  // Read-only operations can execute autonomously without interruption
  if (normalized === "read_only" || normalized === "auto_run" || normalized === "auto-run") {
    return "Auto-run";
  }

  // Mutating or sensitive actions require explicit human operator confirmation
  if (
    normalized === "write_safe" ||
    normalized === "sensitive" ||
    normalized === "dangerous" ||
    normalized === "ask_first" ||
    normalized === "ask first"
  ) {
    return "Ask first";
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
    if (s === "network_read" || s === "network read") return "Network read";
    if (s === "read_only" || s === "read only") return "Read only";
    if (s === "workspace_write" || s === "workspace write") return "Workspace write";
    if (s === "ephemeral_vm" || s === "ephemeral vm") return "Ephemeral VM";
    if (s === "network_write" || s === "network write") return "Network write";
    return sandbox;
  }

  // Derive contextual sandbox from category if sandbox field is empty
  const cat = (category ?? "").toLowerCase();
  if (cat.includes("web") || cat.includes("search")) return "Network read";
  if (cat.includes("file") || cat.includes("workspace")) return "Workspace write";
  if (cat.includes("computation") || cat.includes("api")) return "Ephemeral VM";
  return "Read only";
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
    <div className="glass border-border hover:border-border/80 bg-card/40 flex flex-col justify-between rounded-md border p-4 transition-all">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="text-foreground text-sm leading-snug font-medium">{tool.name}</div>
          <Switch
            checked={isEnabled}
            disabled={isPending}
            onCheckedChange={(checked) => {
              // Dispatch toggle handler to synchronize with live database
              onToggle?.(checked);
            }}
            aria-label={`Toggle ${tool.name}`}
          />
        </div>
        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
          {tool.description || "Configured agent capability with granular isolation."}
        </p>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs font-medium">
          {permLabel}
        </span>
        <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-mono text-xs">
          {sandboxLabel}
        </span>
      </div>
    </div>
  );
}
