import React from "react";
import { Button, Textarea } from "@yuva-devlab/ui";
import { Send, Sparkles } from "lucide-react";

export interface PromptBarProps {
  prompt: string;
  isRunning: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * Prompt input composer for the Execution Console.
 */
export function PromptBar({
  prompt,
  isRunning,
  onPromptChange,
  onSubmit,
}: PromptBarProps): React.JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isRunning) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Sparkles className="text-primary size-3.5" />
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Agent Prompt Composer
        </span>
      </div>

      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e): void => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="State an objective for the agent cluster... (Press ⌘+Enter to execute)"
          className="bg-background/70 border-border/80 focus-visible:ring-primary min-h-18 resize-none pr-24 font-mono text-xs"
        />

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isRunning || !prompt.trim()}
            className="h-7 gap-1.5 px-3 text-xs font-medium shadow-sm"
          >
            <span>Run</span>
            <Send className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
