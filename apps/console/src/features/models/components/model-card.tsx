"use client";

/**
 * @file model-card.tsx
 * @description Card component displaying an active LLM model with context limits, status, and provider.
 * Follows the layout and status badges from orchestrai-src.
 * @module apps/console/features/models/components
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@yuva-devlab/ui";
import { StatusBadge } from "@/components/ui/status-badge";
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
    <Card className="border-border bg-card/60 flex flex-col justify-between rounded-md p-5 shadow-xs">
      <div>
        <CardHeader className="p-0 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-foreground text-sm font-semibold tracking-tight">
                {model.name}
              </CardTitle>
              <div className="text-muted-foreground mt-0.5 text-xs">
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

        <CardContent className="p-0">
          <dl className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs">
            <div>
              <dt className="text-muted-foreground">{UI_COPY.MODELS.CARD.LATENCY_LABEL}</dt>
              <dd className="text-foreground mt-0.5 font-medium">
                {latency > 0 ? UI_COPY.MODELS.CARD.MS_FORMAT(latency) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{UI_COPY.MODELS.CARD.CONTEXT_LABEL}</dt>
              <dd className="text-foreground mt-0.5 font-medium">{contextFormatted}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{UI_COPY.MODELS.CARD.COST_LABEL}</dt>
              <dd className="text-foreground mt-0.5 font-medium">{cost}</dd>
            </div>
          </dl>
        </CardContent>
      </div>

      <div className="border-border/50 mt-4 flex items-center justify-between border-t pt-3 text-xs">
        {model.isEnabled ? (
          <span className="text-success font-medium">{UI_COPY.MODELS.CARD.KEY_CONNECTED}</span>
        ) : (
          <span className="text-muted-foreground">{UI_COPY.MODELS.CARD.NO_KEY}</span>
        )}
        {model.isDefault && (
          <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold">
            {UI_COPY.MODELS.CARD.DEFAULT_BADGE}
          </span>
        )}
      </div>
    </Card>
  );
}
