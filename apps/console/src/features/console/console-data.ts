/**
 * @file console-data.ts
 * @description Event definitions, telemetry structures, and Lucide icon maps for the Live Console.
 * @module apps/console/features/console
 */

import {
  Bot,
  Database,
  FileCode2,
  GitBranch,
  Globe2,
  Network,
  Search,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** All possible event status values in the execution event log. */
export type EventStatus = "done" | "active" | "waiting";

/** An individual event emitted during a live agent execution stream. */
export interface ExecutionEvent {
  id: string;
  agent: string;
  title: string;
  detail: string;
  meta: string;
  type: "think" | "plan" | "search" | "web" | "file" | "database" | "delegate" | "model";
}

/** Telemetry snapshot metrics for real-time monitoring. */
export interface ConsoleTelemetry {
  activeAgents: number;
  tokensProcessed: number;
  averageLatencyMs: number;
}

/** Lucide icon map keyed by execution event type. */
export const EVENT_ICONS: Record<ExecutionEvent["type"], LucideIcon> = {
  think: Sparkles,
  plan: GitBranch,
  search: Search,
  web: Globe2,
  file: FileCode2,
  database: Database,
  delegate: Network,
  model: Bot,
};

/** Default initial telemetry snapshot. */
export const DEFAULT_TELEMETRY: ConsoleTelemetry = {
  activeAgents: 0,
  tokensProcessed: 0,
  averageLatencyMs: 0,
};
