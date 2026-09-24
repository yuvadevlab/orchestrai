"use client";

/**
 * @file studio-message-item.tsx
 * @description Single conversation message entry with user bubble, thinking, artifacts, permission gates, and markdown response.
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { Bot, Check, Copy, Sparkles } from "lucide-react";
import { Button, Badge } from "@yuva-devlab/ui";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { StudioThinkingBlock } from "./studio-thinking-block";
import { StudioPlanCard } from "./studio-plan-card";
import { StudioPermissionCard } from "./studio-permission-card";
import { ArtifactRenderer } from "./artifacts";
import type { CoworkMessage } from "../types";

export interface StudioMessageItemProps {
  message: CoworkMessage;
  onResolveApproval?: (
    approvalId: string,
    scope: "once" | "session" | "permanent" | "deny",
  ) => Promise<void>;
}

/**
 * Renders an individual user query or agent cowork response.
 */
export function StudioMessageItem({
  message,
  onResolveApproval,
}: StudioMessageItemProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = (): void => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex w-full justify-end py-3">
        <div className="border-border/80 bg-secondary/80 max-w-2xl rounded-md rounded-tr-sm border px-4 py-3 shadow-xs">
          <div className="text-muted-foreground mb-1 flex items-center justify-between gap-3 font-mono text-[11px]">
            <span className="text-foreground font-semibold">You</span>
            <span>{message.timestamp}</span>
          </div>
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 py-3">
      {/* Agent Header Metadata */}
      <div className="flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary grid size-6 place-items-center rounded-md">
            <Bot className="size-3.5" />
          </div>
          <span className="text-foreground font-semibold">
            {message.specialistName || "Lead Orchestrator"}
          </span>
          {message.model && (
            <Badge
              variant="outline"
              className="text-muted-foreground px-1.5 py-0 font-mono text-[10px]"
            >
              {message.model}
            </Badge>
          )}
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
          <span>{message.timestamp}</span>
          {message.content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground size-6 p-0"
              title="Copy response"
            >
              {copied ? <Check className="text-primary size-3" /> : <Copy className="size-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Main Agent Response Body */}
      <div className="border-border/60 bg-card/40 rounded-md border p-4 shadow-xs">
        {/* Thinking Accordion */}
        {message.thinking && (
          <StudioThinkingBlock
            text={message.thinking.text}
            durationSeconds={message.thinking.durationSeconds}
            initiallyCollapsed={message.thinking.collapsed}
          />
        )}

        {/* Structured Execution Plan */}
        {message.plan && message.plan.length > 0 && <StudioPlanCard steps={message.plan} />}

        {/* Purpose-Built Multi-Domain Artifacts */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="my-2 space-y-2">
            {message.artifacts.map((artifact) => (
              <ArtifactRenderer key={artifact.id} artifact={artifact} />
            ))}
          </div>
        )}

        {/* Human-in-the-Loop Clearance Gate */}
        {message.approvalRequest && onResolveApproval && (
          <StudioPermissionCard request={message.approvalRequest} onResolve={onResolveApproval} />
        )}

        {/* Streaming or Completed Markdown Response */}
        {message.content ? (
          <div className="mt-2">
            <MarkdownRenderer content={message.content} />
          </div>
        ) : message.isStreaming ? (
          <div className="text-muted-foreground flex items-center gap-2 py-2 font-mono text-xs">
            <Sparkles className="text-primary size-3.5 animate-spin" />
            <span>Agent synthesizing and generating outputs...</span>
          </div>
        ) : null}

        {/* Footer Diagnostics */}
        {(message.tokensIn || message.tokensOut) && (
          <div className="border-border/40 text-muted-foreground/80 mt-4 flex items-center justify-between border-t pt-2 font-mono text-[10px]">
            <span>
              Tokens: {(message.tokensIn ?? 0).toLocaleString()} in /{" "}
              {(message.tokensOut ?? 0).toLocaleString()} out
            </span>
            {message.executionId && (
              <span className="max-w-45 truncate">Exec: {message.executionId}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
