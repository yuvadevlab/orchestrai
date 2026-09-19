import React from "react";
import { Check, Minus } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { models } from "@/lib/mock-db";

function Capability({ label, enabled }: { label: string; enabled: boolean }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="text-primary size-3.5" />
      ) : (
        <Minus className="text-muted-foreground size-3.5" />
      )}
      <span className={enabled ? "text-foreground font-medium" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

/**
 * Reasoning engines available to the orchestrator with capabilities matrix.
 */
export default function ModelsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Models"
      breadcrumb="Models"
      description="Routing options for reasoning work, with the capabilities each one can be trusted with."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => (
          <Panel key={model.id}>
            <div className="flex items-start gap-2">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold">{model.name}</p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  {model.provider} · {model.context}
                </p>
              </div>
              <span className="ml-auto">
                <StatusChip status={model.availability} />
              </span>
            </div>

            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{model.role}</p>

            <div className="border-border mt-3 space-y-1.5 border-t pt-3 text-xs">
              <Capability label="Streaming tokens" enabled={model.streaming} />
              <Capability label="Tool calling" enabled={model.toolCalling} />
              <Capability label="Structured output" enabled={model.structuredOutput} />
            </div>

            <p className="text-muted-foreground mt-3 font-mono text-[10px]">
              {model.latency} first token
            </p>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
