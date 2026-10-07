/**
 * @file use-prompt-commands.ts
 * @description State hook managing @ mentions detection, / slash commands detection, and token replacement.
 * @module apps/console/features/studio/hooks
 */

import { useState, useEffect } from "react";
import {
  MENTION_QUERY_REGEX,
  SLASH_COMMAND_PREFIX_REGEX,
  WORD_SPLIT_REGEX,
} from "@orchestrai/regex";
import type { MentionSelection } from "../components/studio-mention-popover";
import type { SlashCommandItem } from "../components/studio-slash-commands";

export interface UsePromptCommandsOptions {
  readonly prompt: string;
  readonly onChange: (newPrompt: string) => void;
  readonly onSelectMode: (mode: string) => void;
  readonly onSelectSpecialist: (id: string) => void;
  readonly onResetThread?: () => void;
}

export interface UsePromptCommandsReturn {
  readonly mentionQuery: string | null;
  readonly slashQuery: string | null;
  readonly handleSelectMention: (selection: MentionSelection) => void;
  readonly handleSelectSlashCommand: (cmd: SlashCommandItem) => void;
  readonly closeMention: () => void;
  readonly closeSlash: () => void;
}

/**
 * Parses current prompt cursor position to detect active @ mentions and / slash commands.
 */
export function usePromptCommands({
  prompt,
  onChange,
  onSelectMode,
  onSelectSpecialist,
  onResetThread,
}: UsePromptCommandsOptions): UsePromptCommandsReturn {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);

  useEffect(() => {
    // Detect slash command at the very start of prompt or line
    if (prompt.startsWith("/")) {
      const firstWord = prompt.split(WORD_SPLIT_REGEX)[0] ?? "";
      // Only show popup while typing the command itself (before typing following arguments)
      if (!prompt.includes(" ") || firstWord === "/") {
        setSlashQuery(firstWord);
        setMentionQuery(null);
        return;
      }
    }
    setSlashQuery(null);

    // Detect @ mention at current word using canonical regex
    const match = MENTION_QUERY_REGEX.exec(prompt);
    if (match) {
      setMentionQuery(match[1] ?? "");
    } else {
      setMentionQuery(null);
    }
  }, [prompt]);

  const handleSelectMention = (selection: MentionSelection): void => {
    // Replace the trailing @query with @label using canonical regex
    const replaced = prompt.replace(MENTION_QUERY_REGEX, (match) => {
      const leadingSpace = match.startsWith(" ") ? " " : "";
      return `${leadingSpace}@${selection.value} `;
    });

    onChange(replaced);
    setMentionQuery(null);

    // If a specialist was mentioned, automatically select that specialist persona in prompt bar
    if (selection.type === "specialist" && selection.extraId) {
      onSelectSpecialist(selection.extraId);
    }
  };

  const handleSelectSlashCommand = (cmd: SlashCommandItem): void => {
    setSlashQuery(null);

    if (cmd.targetMode) {
      onSelectMode(cmd.targetMode);
      // Strip the /command prefix using canonical regex
      const stripped = prompt.replace(SLASH_COMMAND_PREFIX_REGEX, "");
      onChange(stripped);
      return;
    }

    if (cmd.action === "clear" && onResetThread) {
      onResetThread();
      onChange("");
      return;
    }

    // Default: strip slash command prefix using canonical regex
    const stripped = prompt.replace(SLASH_COMMAND_PREFIX_REGEX, "");
    onChange(stripped);
  };

  return {
    mentionQuery,
    slashQuery,
    handleSelectMention,
    handleSelectSlashCommand,
    closeMention: () => setMentionQuery(null),
    closeSlash: () => setSlashQuery(null),
  };
}
