import React from "react";
import { Button, Textarea } from "@yuva-devlab/ui";
import { Send, Sparkles } from "lucide-react";
import type { DemoType } from "../types";

export interface PromptBarProps {
  prompt: string;
  selectedDemo: DemoType;
  isRunning: boolean;
  onPromptChange: (value: string) => void;
  onSelectDemo: (demo: DemoType) => void;
  onSubmit: () => void;
}

/**
 * Prompt input composer for the Execution Console.
 * Allows quick selection of demo presets and custom prompt submission.
 */
export function PromptBar({
  prompt,
  selectedDemo,
  isRunning,
  onPromptChange,
  onSelectDemo,
  onSubmit,
}: PromptBarProps): React.JSX.Element {
  const demos: { key: DemoType; label: string }[] = [
    { key: "research", label: "Research Agent" },
    { key: "developer", label: "Developer Agent" },
    { key: "multi", label: "Multi-Agent Governance" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Submit on Cmd+Enter / Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isRunning) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-sm">
      {/* Demo Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="text-primary size-3.5" />
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Quick Scenarios:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {demos.map((d) => (
            <Button
              key={d.key}
              variant={selectedDemo === d.key ? "default" : "outline"}
              size="sm"
              onClick={(): void => onSelectDemo(d.key)}
              className="h-7 px-2.5 font-mono text-xs"
            >
              {d.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Textarea Input */}
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e): void => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Instruct the agent cluster... (Press ⌘+Enter to execute)"
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
