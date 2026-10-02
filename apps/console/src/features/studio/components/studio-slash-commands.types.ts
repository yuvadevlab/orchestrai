/**
 * @file studio-slash-commands.types.ts
 * @description Command definitions and types for the studio slash command palette.
 * @module apps/console/features/studio/components
 */

import React from "react";
import {
  CheckSquare,
  Terminal,
  MessageSquare,
  Sparkles,
  Trash2,
  Minimize2,
  Folder,
  HelpCircle,
} from "lucide-react";
import { AgentMode } from "@orchestrai/shared-types";

export interface SlashCommandItem {
  readonly id: string;
  readonly command: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly targetMode?: AgentMode;
  readonly action?: "clear" | "compact" | "files" | "help";
}

export const STUDIO_SLASH_COMMANDS: readonly SlashCommandItem[] = [
  {
    id: "cmd-plan",
    command: "/plan",
    title: "Plan Mode",
    description: "Decompose complex task into interactive checklist before acting",
    icon: CheckSquare,
    targetMode: AgentMode.PLAN,
  },
  {
    id: "cmd-act",
    command: "/act",
    title: "Act Mode",
    description: "Autonomous tool execution with filesystem and shell access",
    icon: Terminal,
    targetMode: AgentMode.ACT,
  },
  {
    id: "cmd-chat",
    command: "/chat",
    title: "Chat Mode",
    description: "Conversational brainstorming and reasoning without tools",
    icon: MessageSquare,
    targetMode: AgentMode.CHAT,
  },
  {
    id: "cmd-auto",
    command: "/auto",
    title: "Auto Mode",
    description: "Autonomous heuristic intent routing per execution turn",
    icon: Sparkles,
    targetMode: AgentMode.AUTO,
  },
  {
    id: "cmd-clear",
    command: "/clear",
    title: "Clear Thread",
    description: "Clear active conversation messages and reset canvas",
    icon: Trash2,
    action: "clear",
  },
  {
    id: "cmd-compact",
    command: "/compact",
    title: "Compact Context",
    description: "Summarize earlier message history to conserve context window",
    icon: Minimize2,
    action: "compact",
  },
  {
    id: "cmd-files",
    command: "/files",
    title: "List Files",
    description: "Inspect project files in current workspace directory",
    icon: Folder,
    action: "files",
  },
  {
    id: "cmd-help",
    command: "/help",
    title: "Help & Shortcuts",
    description: "View available slash commands, keyboard shortcuts and cheat sheet",
    icon: HelpCircle,
    action: "help",
  },
];
