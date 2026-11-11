"use client";

/**
 * @file model-card.tsx
 * @description Card component displaying an active LLM model with context limits, status, and provider.
 * Follows the layout and status badges from orchestrai-src.
 * @module apps/console/features/models/components
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@orchestrai/ui";
import { StatusBadge } from "@orchestrai/ui/components/status-badge";
import { UI_COPY } from "@/lib/ui-copy";
import type { LlmModel } from "../types";

export interface ModelCardProps {
  readonly model: LlmModel;
  readonly providerName?: string;
}

/**
 * Visual card displaying an LLM model catalog item with context window, provider, latency, and economics.
 */
export function ModelCard({ model, providerName }: ModelCardProps): React.JSX.Element {
  const contextFormatted = model.contextWindow
    ? model.contextWindow >= 1_000_000
      ? `${(model.contextWindow / 1_000_000).toFixed(0)}M`
      : `${Math.round(model.contextWindow / 1_000)}K`
    : "8K";

  const config = (model.defaultConfig || {}) as Record<string, unknown>;
  const latency = typeof config.latency === "number" ? config.latency : model.isEnabled ? 480 : 0;
  const cost = typeof config.cost === "string" ? config.cost : "$1.25 / 1M";

  return (
    <Card className="orch-model-card">
      <div>
        <CardHeader style={{ padding: 0, paddingBottom: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <div>
              <CardTitle
                style={{
                  color: "var(--foreground)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {model.name}
              </CardTitle>
              <div
                style={{
                  color: "var(--mutedForeground)",
                  marginTop: "0.125rem",
                  fontSize: "0.75rem",
                }}
              >
                {providerName || UI_COPY.MODELS.CARD.FALLBACK_PROVIDER} · {model.modelIdentifier}
              </div>
            </div>
            <StatusBadge
              status={
                model.isEnabled
                  ? UI_COPY.MODELS.CARD.STATUS_OPERATIONAL
                  : UI_COPY.MODELS.CARD.STATUS_OFFLINE
              }
            />
          </div>
        </CardHeader>

        <CardContent style={{ padding: 0 }}>
          <dl
            style={{
              marginTop: "0.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
            }}
          >
            <div>
              <dt style={{ color: "var(--mutedForeground)" }}>
                {UI_COPY.MODELS.CARD.LATENCY_LABEL}
              </dt>
              <dd style={{ color: "var(--foreground)", marginTop: "0.125rem", fontWeight: 500 }}>
                {latency > 0 ? UI_COPY.MODELS.CARD.MS_FORMAT(latency) : "—"}
              </dd>
            </div>
            <div>
              <dt style={{ color: "var(--mutedForeground)" }}>
                {UI_COPY.MODELS.CARD.CONTEXT_LABEL}
              </dt>
              <dd style={{ color: "var(--foreground)", marginTop: "0.125rem", fontWeight: 500 }}>
                {contextFormatted}
              </dd>
            </div>
            <div>
              <dt style={{ color: "var(--mutedForeground)" }}>{UI_COPY.MODELS.CARD.COST_LABEL}</dt>
              <dd style={{ color: "var(--foreground)", marginTop: "0.125rem", fontWeight: 500 }}>
                {cost}
              </dd>
            </div>
          </dl>
        </CardContent>
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          paddingTop: "0.75rem",
          fontSize: "0.75rem",
        }}
      >
        {model.isEnabled ? (
          <span style={{ color: "var(--success, #22c55e)", fontWeight: 500 }}>
            {UI_COPY.MODELS.CARD.KEY_CONNECTED}
          </span>
        ) : (
          <span style={{ color: "var(--mutedForeground)" }}>{UI_COPY.MODELS.CARD.NO_KEY}</span>
        )}
        {model.isDefault && (
          <span
            style={{
              backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
              color: "var(--primary)",
              borderRadius: "var(--radius-md, 0.375rem)",
              paddingInline: "0.375rem",
              paddingBlock: "0.125rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.625rem",
              fontWeight: 600,
            }}
          >
            {UI_COPY.MODELS.CARD.DEFAULT_BADGE}
          </span>
        )}
      </div>
    </Card>
  );
}
