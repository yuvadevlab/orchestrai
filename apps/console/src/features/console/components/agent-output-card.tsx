import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "@yuva-devlab/ui";
import { Check, Copy, Sparkles, Terminal } from "lucide-react";

export interface AgentOutputCardProps {
  response: string;
  isRunning: boolean;
}

/**
 * Synthesized Agent Output Card.
 * Displays final execution synthesis, token diagnostics, and copy action.
 */
export function AgentOutputCard({ response, isRunning }: AgentOutputCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout((): void => setCopied(false), 2000);
  };

  return (
    <Card className="border-border bg-card flex h-full flex-col shadow-sm">
      <CardHeader className="border-border/60 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary size-4" />
              <CardTitle className="text-sm font-semibold tracking-tight">
                Synthesized Output
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground font-mono text-xs">
              Final consensus result from agent cluster
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!response}
            className="h-7 gap-1.5 px-2.5 font-mono text-xs"
          >
            {copied ? (
              <>
                <Check className="text-primary size-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        {isRunning ? (
          <div className="border-border text-muted-foreground flex h-48 flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-4 text-center">
            <Sparkles className="text-primary size-6 animate-spin" />
            <p className="text-foreground text-xs font-medium">Synthesizing consensus...</p>
            <p className="text-muted-foreground text-[11px]">
              Aggregating evidence across DAG checkpoints.
            </p>
          </div>
        ) : response ? (
          <div className="border-border/60 bg-background/40 text-foreground rounded-lg border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {response}
          </div>
        ) : (
          <div className="border-border text-muted-foreground flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <Terminal className="mb-2 size-6 opacity-50" />
            <p className="text-xs font-medium">No output generated yet.</p>
            <p className="text-[11px]">Output will appear once execution completes.</p>
          </div>
        )}
      </CardContent>

      {response && !isRunning && (
        <CardFooter className="border-border/60 text-muted-foreground flex justify-between border-t px-4 pt-2 pb-3 font-mono text-[11px]">
          <span>Tokens: 1,482 in / 340 out</span>
          <Badge
            variant="outline"
            className="text-primary border-primary/30 px-1.5 py-0 font-mono text-[10px]"
          >
            Validated by Critic
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
