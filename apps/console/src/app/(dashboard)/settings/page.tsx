"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, Switch } from "@yuva-devlab/ui";
import { models } from "@/lib/mock-db";

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}): React.JSX.Element {
  return (
    <div className="border-border/60 flex items-start gap-3 border-b pb-3.5 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} className="mt-0.5" />
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): React.JSX.Element {
  return (
    <div className="border-border/60 flex items-center justify-between gap-3 border-b pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-[11px]" : "font-medium"}>{value}</dd>
    </div>
  );
}

/**
 * System and orchestration configuration view.
 */
export default function SettingsPage(): React.JSX.Element {
  const [autonomy, setAutonomy] = useState(true);
  const [approvals, setApprovals] = useState(true);
  const [streaming, setStreaming] = useState(true);
  const [telemetry, setTelemetry] = useState(false);

  return (
    <PageShell
      title="Settings"
      breadcrumb="Settings"
      description="How much the orchestrator may decide on its own, and where a human stays in the loop."
    >
      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        <Panel title="Orchestration Autonomy">
          <div className="space-y-3.5">
            <Toggle
              label="Autonomous delegation"
              hint="Let the supervisor recruit specialist agents without asking."
              checked={autonomy}
              onChange={setAutonomy}
            />
            <Toggle
              label="Require approval for writes"
              hint="Pause the execution graph before any destructive tool call."
              checked={approvals}
              onChange={setApprovals}
            />
            <Toggle
              label="Stream partial responses"
              hint="Render the answer as it is produced instead of on completion."
              checked={streaming}
              onChange={setStreaming}
            />
            <Toggle
              label="Share anonymous telemetry"
              hint="Send aggregate execution metrics to improve routing."
              checked={telemetry}
              onChange={setTelemetry}
            />
          </div>
        </Panel>

        <Panel title="Execution Defaults">
          <dl className="space-y-2.5 text-xs">
            <Row label="Default model" value={models[0]?.name ?? "—"} />
            <Row label="Fallback model" value={models[1]?.name ?? "—"} />
            <Row label="Max parallel agents" value="4 workers" />
            <Row label="Execution timeout" value="10m" mono />
            <Row label="Token budget / run" value="120,000" mono />
          </dl>
        </Panel>

        <Panel title="Workspace & Security" className="md:col-span-2">
          <dl className="space-y-2.5 text-xs">
            <Row label="Workspace" value="orchestrai-core" mono />
            <Row label="Region" value="eu-west-1" mono />
            <Row label="API key" value="sk_live_••••••••••••7f2a" mono />
            <Row label="Event webhook" value="https://hooks.orchestrai.dev/events" mono />
          </dl>
        </Panel>
      </div>
    </PageShell>
  );
}
