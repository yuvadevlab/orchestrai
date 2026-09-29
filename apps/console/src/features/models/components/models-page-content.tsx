"use client";

/**
 * @file models-page-content.tsx
 * @description Model Providers & Routing — live catalog of models and providers fetched from the API.
 * @module apps/console/features/models/components
 */

import React, { useState } from "react";
import { Button } from "@yuva-devlab/ui";
import { Plus, Cpu } from "lucide-react";
import { ModelCard } from "./model-card";
import { ModelDialog } from "./model-dialog";
import { CostLatencyCockpit } from "./cost-latency-cockpit";
import { useModels, useProviders } from "../api";
import { EmptyState } from "@/components/ui";
import { PageShell } from "@/components/layout/page-shell";

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
      title="Model Providers & Routing"
      breadcrumb="Models"
      stats={`${models.length} models · ${providers.length} providers`}
      description="Live AI models, context limits, and inference engines available across the workspace."
      actions={
        <div className="flex items-center gap-2">
          <div className="bg-muted/30 border-border/60 flex rounded border p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === "catalog"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Model Catalog
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("telemetry")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === "telemetry"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cost & Latency Cockpit
            </button>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
          >
            <Plus className="size-3.5" />
            <span>Add model</span>
          </Button>
        </div>
      }
    >
      {activeTab === "telemetry" ? (
        <CostLatencyCockpit />
      ) : isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-md border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Loading live model catalog...
          </span>
        </div>
      ) : models.length === 0 ? (
        <>
          <EmptyState
            icon={Cpu}
            title="No Models Configured"
            description="No active models registered in the database catalog. Configure a model endpoint to enable agent inference."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="h-8 cursor-pointer font-mono text-xs"
              >
                <Plus className="mr-1.5 size-3.5" /> Configure First Model
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
