"use client";

/**
 * @file apps/console/src/features/models/components/cost-latency-cockpit.tsx
 * @description Real-time model routing, latency percentiles, and tenant budget telemetry cockpit.
 * @module apps/console/features/models/components
 */

import React, { useState } from "react";
import { Gauge, Zap, DollarSign, ShieldAlert, Cpu } from "lucide-react";
import { Button } from "@yuva-devlab/ui";

interface ProviderTelemetry {
  providerId: string;
  name: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  costPer1kPrompt: number;
  costPer1kCompletion: number;
  availabilityPercent: number;
}

const TELEMETRY_MOCK: ProviderTelemetry[] = [
  {
    providerId: "openai",
    name: "OpenAI (GPT-4o)",
    p50Ms: 380,
    p95Ms: 820,
    p99Ms: 1450,
    costPer1kPrompt: 0.005,
    costPer1kCompletion: 0.015,
    availabilityPercent: 99.98,
  },
  {
    providerId: "anthropic",
    name: "Anthropic (Claude 3.5 Sonnet)",
    p50Ms: 410,
    p95Ms: 790,
    p99Ms: 1200,
    costPer1kPrompt: 0.003,
    costPer1kCompletion: 0.015,
    availabilityPercent: 99.95,
  },
  {
    providerId: "google",
    name: "Google (Gemini 1.5 Pro)",
    p50Ms: 320,
    p95Ms: 650,
    p99Ms: 980,
    costPer1kPrompt: 0.00125,
    costPer1kCompletion: 0.005,
    availabilityPercent: 99.99,
  },
];

/**
 * High-density operations cockpit for model routing latency and budget enforcement.
 */
export function CostLatencyCockpit(): React.JSX.Element {
  const [activeStrategy, setActiveStrategy] = useState<string>("LOWEST_LATENCY");

  const monthlyBudgetLimit = 500;
  const currentMonthSpend = 142.65;
  const spendPercent = Math.min(100, Math.round((currentMonthSpend / monthlyBudgetLimit) * 100));

  return (
    <div className="space-y-4">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border/60 bg-card/60 rounded-md border p-3 backdrop-blur">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Cluster P95 Latency</span>
            <Zap className="text-primary size-3.5" />
          </div>
          <span className="text-foreground mt-1 block font-mono text-xl font-bold">720 ms</span>
          <span className="text-primary text-[10px]">Dynamic Lowest-Latency Routing Active</span>
        </div>

        <div className="border-border/60 bg-card/60 rounded-md border p-3 backdrop-blur">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Current Month Token Spend</span>
            <DollarSign className="text-primary size-3.5" />
          </div>
          <span className="text-foreground mt-1 block font-mono text-xl font-bold">
            ${currentMonthSpend}
          </span>
          <span className="text-muted-foreground text-[10px]">
            {spendPercent}% of ${monthlyBudgetLimit} cap
          </span>
        </div>

        <div className="border-border/60 bg-card/60 rounded-md border p-3 backdrop-blur">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Quota Enforcement Status</span>
            <Gauge className="text-primary size-3.5" />
          </div>
          <span className="text-primary mt-1 block font-mono text-xl font-bold">NORMAL</span>
          <span className="text-muted-foreground text-[10px]">Threshold warning at 80%</span>
        </div>

        <div className="border-border/60 bg-card/60 rounded-md border p-3 backdrop-blur">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Fallback Cascade</span>
            <ShieldAlert className="text-primary size-3.5" />
          </div>
          <span className="text-foreground mt-1 block font-mono text-xl font-bold">3 Tiers</span>
          <span className="text-muted-foreground text-[10px]">Google → Anthropic → OpenAI</span>
        </div>
      </div>

      {/* Latency Percentiles & Rate Matrix */}
      <div className="border-border/60 bg-card/60 rounded-md border p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-primary size-4" />
            <h3 className="text-sm font-semibold tracking-tight">Provider Latency & Rate Matrix</h3>
          </div>
          <div className="flex items-center gap-1">
            {(["LOWEST_LATENCY", "LEAST_EXPENSIVE", "ROUND_ROBIN"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={activeStrategy === s ? "default" : "outline"}
                onClick={() => setActiveStrategy(s)}
                className="h-7 font-mono text-[10px]"
              >
                {s.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-border/40 text-muted-foreground border-b font-mono text-[11px]">
                <th className="pb-2 font-normal">Provider Engine</th>
                <th className="pb-2 font-normal">P50</th>
                <th className="pb-2 font-normal">P95</th>
                <th className="pb-2 font-normal">P99</th>
                <th className="pb-2 font-normal">Prompt / 1k</th>
                <th className="pb-2 font-normal">Compl / 1k</th>
                <th className="pb-2 font-normal">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-border/20 divide-y font-mono text-[11px]">
              {TELEMETRY_MOCK.map((row) => (
                <tr key={row.providerId} className="hover:bg-muted/10 transition-colors">
                  <td className="text-foreground py-2.5 font-sans font-medium">{row.name}</td>
                  <td className="py-2.5">{row.p50Ms}ms</td>
                  <td className="text-primary py-2.5">{row.p95Ms}ms</td>
                  <td className="py-2.5">{row.p99Ms}ms</td>
                  <td className="py-2.5">${row.costPer1kPrompt.toFixed(4)}</td>
                  <td className="py-2.5">${row.costPer1kCompletion.toFixed(4)}</td>
                  <td className="text-primary py-2.5">{row.availabilityPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
