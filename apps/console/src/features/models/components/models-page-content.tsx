"use client";

/**
 * @file models-page-content.tsx
 * @description Model Providers and Routing view with EmptyState support and interactive provider configuration.
 * @module apps/console/features/models/components
 */

import React, { useState } from "react";
import { Badge, Button } from "@yuva-devlab/ui";
import { Plus, Cpu } from "lucide-react";
import { ModelCard } from "./model-card";
import { ModelDialog } from "./model-dialog";
import { useModels } from "@/features/models/api";
import { EmptyState } from "@/components/ui";

export function ModelsPageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: models, isLoading, refetch } = useModels();

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">
              Model Providers & Routing
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {models.length} Providers
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Configure LLM endpoints, token limits, fallback cascades, and real-time cost telemetry.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>Add Model</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Loading model providers...
          </span>
        </div>
      ) : models.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No Model Providers Configured"
          description="Configure LLM providers (Ollama, OpenAI, Anthropic) or local model endpoints to enable agent inference."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="h-8 cursor-pointer font-mono text-xs"
            >
              <Plus className="mr-1.5 size-3.5" /> Configure First Provider
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {models.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      )}

      <ModelDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
