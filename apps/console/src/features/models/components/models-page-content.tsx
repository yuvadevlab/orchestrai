"use client";

/**
 * @file models-page-content.tsx
 * @description Model Providers & Routing — live catalog of models and providers fetched from the API.
 * @module apps/console/features/models/components
 */

import React, { useState } from "react";
import { Button } from "@orchestrai/ui";
import { Plus, Cpu } from "lucide-react";
import { ModelCard } from "./model-card";
import { ModelDialog } from "./model-dialog";
import { CostLatencyCockpit } from "./cost-latency-cockpit";
import { useModels, useProviders } from "../api";
import { EmptyState, CardGridSkeleton } from "@orchestrai/ui";
import { PageShell } from "@/components/layout/page-shell";
import { UI_COPY } from "@/lib/ui-copy";

/** Model Providers page content displaying live database models. */
export function ModelsPageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: models = [], isLoading: loadingModels, refetch: refetchModels } = useModels();
  const {
    data: providers = [],
    isLoading: loadingProviders,
    refetch: refetchProviders,
  } = useProviders();

  const isLoading = loadingModels || loadingProviders;

  const providerMap = new Map<string, string>();
  for (const p of providers) {
    providerMap.set(p.providerId, p.name);
  }

  const handleRefetch = (): void => {
    refetchModels();
    refetchProviders();
  };

  const [activeTab, setActiveTab] = useState<"catalog" | "telemetry">("catalog");

  return (
    <PageShell
      title={UI_COPY.MODELS.PAGE_TITLE}
      breadcrumb={UI_COPY.MODELS.BREADCRUMB}
      stats={UI_COPY.MODELS.STATS(models.length)}
      description={UI_COPY.MODELS.PAGE_DESCRIPTION}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              backgroundColor: "color-mix(in oklab, var(--muted) 30%, transparent)",
              border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
              display: "flex",
              borderRadius: "var(--radius-sm, 0.25rem)",
              padding: "0.125rem",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              style={{
                borderRadius: "var(--radius-sm, 0.25rem)",
                paddingInline: "0.625rem",
                paddingBlock: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "catalog" ? "var(--primary)" : "transparent",
                color:
                  activeTab === "catalog" ? "var(--primaryForeground)" : "var(--mutedForeground)",
              }}
            >
              {UI_COPY.MODELS.TAB_CATALOG}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("telemetry")}
              style={{
                borderRadius: "var(--radius-sm, 0.25rem)",
                paddingInline: "0.625rem",
                paddingBlock: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "telemetry" ? "var(--primary)" : "transparent",
                color:
                  activeTab === "telemetry" ? "var(--primaryForeground)" : "var(--mutedForeground)",
              }}
            >
              {UI_COPY.MODELS.TAB_COCKPIT}
            </button>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            style={{
              height: "2rem",
              cursor: "pointer",
              gap: "0.375rem",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>{UI_COPY.MODELS.REGISTER_BUTTON}</span>
          </Button>
        </div>
      }
    >
      {activeTab === "telemetry" ? (
        <CostLatencyCockpit />
      ) : isLoading ? (
        <CardGridSkeleton count={6} />
      ) : models.length === 0 ? (
        <>
          <EmptyState
            icon={Cpu}
            title={UI_COPY.MODELS.EMPTY_TITLE}
            description={UI_COPY.MODELS.EMPTY_DESC}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                style={{
                  height: "2rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                }}
              >
                <Plus style={{ marginRight: "0.375rem", width: "0.875rem", height: "0.875rem" }} />{" "}
                {UI_COPY.MODELS.REGISTER_BUTTON}
              </Button>
            }
          />
          <ModelDialog
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleRefetch}
          />
        </>
      ) : (
        <>
          <div className="orch-model-grid">
            {models.map((m) => (
              <ModelCard key={m.modelId} model={m} providerName={providerMap.get(m.providerId)} />
            ))}
          </div>
          <ModelDialog
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleRefetch}
          />
        </>
      )}
    </PageShell>
  );
}
