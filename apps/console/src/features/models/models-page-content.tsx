"use client";

import React, { useState } from "react";
import { Badge, Button } from "@yuva-devlab/ui";
import { Plus } from "lucide-react";
import { ModelCard } from "./components/model-card";
import { MOCK_MODELS } from "./mock-models";

/**
 * Main feature container view for Model Routing.
 */
export function ModelsPageContent(): React.JSX.Element {
  const [models] = useState(MOCK_MODELS);

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">
              Model Providers & Routing
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              Dynamic Fallbacks
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Configure LLM endpoints, token limits, fallback cascades, and real-time cost telemetry.
          </p>
        </div>
        <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Add Model</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {models.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
    </div>
  );
}
