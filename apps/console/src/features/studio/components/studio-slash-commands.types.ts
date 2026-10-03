/**
 * @file studio-slash-commands.types.ts
 * @description Command definitions, icon resolvers, and types for the studio slash command palette.
 * @module apps/console/features/studio/components
 */

import type React from "react";
import {
  CheckSquare,
  Terminal,
  MessageSquare,
  Sparkles,
  Trash2,
  Minimize2,
  Folder,
  HelpCircle,
  Code2,
  Layers,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { AgentMode, type PlatformCommandRecord } from "@orchestrai/shared-types";

/** UI representation of a slash command in the command popover */
export interface SlashCommandItem {
  readonly id: string;
  readonly command: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly targetMode?: AgentMode;
  readonly action?: string;
}

/** Icon dictionary mapping string identifiers to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  CheckSquare,
  Terminal,
  MessageSquare,
  Sparkles,
  Trash2,
  Minimize2,
  Folder,
  HelpCircle,
  Code2,
  Layers,
  Settings,
  Shield,
};

/**
 * Resolves a dynamic icon string from server command record into a Lucide icon component.
 *
 * @param name - Icon name string from database record
 * @returns React icon component
 */
export function resolveCommandIcon(name?: string): LucideIcon {
  // If icon is present in dictionary, return matched Lucide component
  if (name && name in ICON_MAP) {
    return ICON_MAP[name] as LucideIcon;
  }
  // Default fallback icon for unknown or unconfigured icon strings
  return Sparkles;
}

/**
 * Maps a PlatformCommandRecord into a Studio SlashCommandItem.
 *
 * @param record - Command entity
 * @returns UI-ready SlashCommandItem
 */
export function mapPlatformRecordToSlashCommand(record: PlatformCommandRecord): SlashCommandItem {
  return {
    id: record.commandId,
    command: record.command,
    title: record.title,
    description: record.description,
    icon: resolveCommandIcon(record.icon),
    targetMode: record.targetMode as AgentMode | undefined,
    action: record.action,
  };
}
