"use client";

/**
 * @file studio-message-item.tsx
 * @description Single conversation message entry with interleaved chronological segments (thinking, artifacts, clearances, text).
 * @module apps/console/features/studio/components
 */

import React, { useState } from "react";
import { Bot, Check, Copy, Sparkles } from "lucide-react";
import { Button, Badge } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { StudioThinkingBlock } from "./studio-thinking-block";
import { StudioPlanCard } from "./studio-plan-card";
import { CoworkMessageRole, MessageSegmentType } from "@orchestrai/shared-types";
import { ArtifactRenderer } from "./artifacts";
import { ApprovalDecisionChip } from "./approval-decision-chip";
import type { CoworkMessage } from "../types";

export interface StudioMessageItemProps {
  message: CoworkMessage;
}

/**
 * Renders an individual user query or agent cowork response.
 * Interleaves reasoning, tool artifacts, permission decisions, and text in true chronological order.
 */
export function StudioMessageItem({ message }: StudioMessageItemProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === CoworkMessageRole.USER;

  const handleCopy = (): void => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="orch-msg-user-container">
        <div className="orch-msg-user-box">
          <div
            className="orch-flex-row orch-justify-between orch-text-muted orch-font-mono"
            style={{ marginBottom: "0.25rem", gap: "0.75rem", fontSize: "0.6875rem" }}
          >
            <span className="orch-font-semibold" style={{ color: "var(--foreground)" }}>
              {UI_COPY.STUDIO.FEED.USER_LABEL}
            </span>
            <span>{message.timestamp}</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="orch-msg-agent-container">
      {/* Agent Header Metadata */}
      <div className="orch-flex-row orch-justify-between" style={{ alignItems: "center" }}>
        <div className="orch-flex-row orch-gap-xs" style={{ alignItems: "center" }}>
          <div
            style={{
              display: "grid",
              width: "1.5rem",
              height: "1.5rem",
              placeItems: "center",
              borderRadius: "var(--radius-sm, 0.25rem)",
              backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Bot style={{ width: "0.875rem", height: "0.875rem" }} />
          </div>
          <span className="orch-font-semibold" style={{ fontSize: "0.75rem" }}>
            {message.specialistName || UI_COPY.STUDIO.FEED.DEFAULT_SPECIALIST}
          </span>
          {message.model && (
            <Badge
              variant="outline"
              className="orch-font-mono orch-text-muted"
              style={{ padding: "0 0.375rem", fontSize: "0.625rem" }}
            >
              {message.model}
            </Badge>
          )}
        </div>

        <div
          className="orch-flex-row orch-gap-xs orch-text-muted"
          style={{ alignItems: "center", fontSize: "0.6875rem" }}
        >
          <span>{message.timestamp}</span>
          {message.content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="orch-text-muted"
              style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
              title={UI_COPY.STUDIO.FEED.COPY_RESPONSE}
              aria-label={UI_COPY.STUDIO.FEED.COPY_RESPONSE}
            >
              {copied ? (
                <Check
                  className="orch-text-primary"
                  style={{ width: "0.75rem", height: "0.75rem" }}
                />
              ) : (
                <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Agent Response Body */}
      <div className="orch-msg-agent-box">
        {message.segments && message.segments.length > 0 ? (
          // Interleaved chronological timeline of thinking, plans, artifacts, clearances, and text
          message.segments.map((seg) => {
            switch (seg.type) {
              case MessageSegmentType.THINKING:
                return (
                  <StudioThinkingBlock
                    key={seg.id}
                    text={seg.text}
                    durationSeconds={seg.durationSeconds}
                    initiallyCollapsed={seg.collapsed}
                  />
                );
              case MessageSegmentType.PLAN:
                return <StudioPlanCard key={seg.id} steps={seg.steps} />;
              case MessageSegmentType.ARTIFACT:
                return (
                  <div key={seg.id} style={{ margin: "0.5rem 0" }}>
                    <ArtifactRenderer artifact={seg.artifact} />
                  </div>
                );
              case MessageSegmentType.APPROVAL: {
                if (seg.request.resolvedScope) {
                  return <ApprovalDecisionChip key={seg.id} request={seg.request} />;
                }
                return null;
              }
              case MessageSegmentType.TEXT:
                return (
                  <div key={seg.id} style={{ marginTop: "0.5rem" }}>
                    <MarkdownRenderer content={seg.content} />
                  </div>
                );
              default:
                return null;
            }
          })
        ) : (
          // Fallback for legacy messages lacking segments
          <>
            {message.thinking && (
              <StudioThinkingBlock
                text={message.thinking.text}
                durationSeconds={message.thinking.durationSeconds}
                initiallyCollapsed={message.thinking.collapsed}
              />
            )}
            {message.plan && message.plan.length > 0 && <StudioPlanCard steps={message.plan} />}
            {message.artifacts && message.artifacts.length > 0 && (
              <div
                style={{
                  margin: "0.5rem 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {message.artifacts.map((artifact) => (
                  <ArtifactRenderer key={artifact.id} artifact={artifact} />
                ))}
              </div>
            )}
            {message.approvalRequest?.resolvedScope && (
              <ApprovalDecisionChip request={message.approvalRequest} />
            )}
            {message.content && (
              <div style={{ marginTop: "0.5rem" }}>
                <MarkdownRenderer content={message.content} />
              </div>
            )}
          </>
        )}

        {/* Streaming synthesizing indicator */}
        {message.isStreaming && (!message.content || message.content.length === 0) && (
          <div
            className="orch-flex-row orch-gap-xs orch-text-muted orch-font-mono"
            style={{ alignItems: "center", padding: "0.5rem 0", fontSize: "0.75rem" }}
          >
            <Sparkles
              className="orch-text-primary orch-animate-spin"
              style={{ width: "0.875rem", height: "0.875rem" }}
            />
            <span>{UI_COPY.STUDIO.FEED.SYNTHESIZING}</span>
          </div>
        )}

        {/* Footer Diagnostics */}
        {(message.tokensIn || message.tokensOut) && (
          <div
            className="orch-flex-row orch-justify-between orch-font-mono"
            style={{
              marginTop: "1rem",
              borderTop: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
              paddingTop: "0.5rem",
              fontSize: "0.625rem",
              color: "color-mix(in oklab, var(--mutedForeground) 80%, transparent)",
            }}
          >
            <span>
              {UI_COPY.STUDIO.FEED.TOKENS_DIAGNOSTIC(message.tokensIn ?? 0, message.tokensOut ?? 0)}
            </span>
            {message.executionId && (
              <span className="orch-truncate" style={{ maxWidth: "12rem" }}>
                {UI_COPY.STUDIO.FEED.EXEC_DIAGNOSTIC(message.executionId)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
