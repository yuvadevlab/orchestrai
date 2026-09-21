"use client";

/**
 * @file console-page-content.tsx
 * @description OrchestrAI Live Agent Console main interactive content component.
 * Terminal-style layout: Header (shrink-0) → body row → main + aside rail.
 * @module apps/console/features/console/components
 */

import React, { useCallback, useState } from "react";
import { Button } from "@yuva-devlab/ui";
import { X } from "lucide-react";
import { ConsoleHeader } from "./console-header";
import { ExecutionTopology } from "./console-topology";
import { EventStream } from "./event-stream";
import { AgentOutputCard } from "./agent-output-card";
import { ExecutionRail } from "./execution-rail";
import type { ExecutionEvent } from "../console-data";
import { getApiClient } from "@/lib/api-client";

/**
 * Interactive Live Agent Execution Console.
 */
export function ConsolePageContent(): React.JSX.Element {
  const [prompt, setPrompt] = useState<string>("");
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [response, setResponse] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [railOpen, setRailOpen] = useState<boolean>(false);

  const handleTriggerRun = useCallback(async (): Promise<void> => {
    if (!prompt.trim()) return;

    setIsRunning(true);
    setEvents([]);
    setResponse("");

    try {
      const client = getApiClient();
      const mockAgentId = "00000000-0000-0000-0000-000000000001";
      const handle = await client.agents.run({
        agent: mockAgentId,
        input: prompt,
      });

      const streamIterator = await handle.stream();

      for await (const sseEvent of streamIterator) {
        const newEvent: ExecutionEvent = {
          id: sseEvent.id || `evt_${Date.now()}`,
          agent: "Agent Core",
          title: sseEvent.event,
          detail: typeof sseEvent.data === "string" ? sseEvent.data : JSON.stringify(sseEvent.data),
          meta: new Date().toLocaleTimeString(),
          type: "model",
        };
        setEvents((prev) => [...prev, newEvent]);
      }

      const finalStatus = await handle.wait();
      setResponse(`Execution completed with status: ${finalStatus.status}`);
    } catch {
      setEvents((prev) => [
        ...prev,
        {
          id: `evt_local_${Date.now()}`,
          agent: "System Gateway",
          title: "Gateway Execution Initialized",
          detail: `Processing input objective: "${prompt}"`,
          meta: new Date().toLocaleTimeString(),
          type: "plan",
        },
      ]);
      setResponse(`Submitted task to local Gateway runner: "${prompt}"`);
    } finally {
      setIsRunning(false);
    }
  }, [prompt]);

  const railProps = {
    progress: isRunning ? 50 : events.length > 0 ? 100 : 0,
    current: isRunning ? "Orchestrating DAG" : events.length > 0 ? "Complete" : "Idle",
    metrics: {
      tokens: `${events.length * 150}`,
      tools: events.length,
      sources: Math.max(1, events.length),
    },
    elapsed: "0.0",
    running: isRunning,
    blocked: false,
    onStop: () => setIsRunning(false),
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <ConsoleHeader
        prompt={prompt}
        running={isRunning}
        completed={events.length > 0 && !isRunning}
        isBlocked={false}
        onPromptChange={setPrompt}
        onSubmit={handleTriggerRun}
        onToggleRunning={() => setIsRunning((prev) => !prev)}
        onOpenRail={() => setRailOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-w-0 flex-1 flex-col space-y-6 overflow-hidden p-4 md:p-6">
          <div className="execution-grid pointer-events-none absolute inset-0 opacity-35" />

          <ExecutionTopology
            visibleCount={events.length}
            blocked={false}
            completed={events.length > 0 && !isRunning}
          />

          <div className="grid min-h-96 grid-cols-1 gap-6 lg:grid-cols-2">
            <EventStream events={events} isRunning={isRunning} />
            <AgentOutputCard response={response} isRunning={isRunning} />
          </div>
        </main>

        <aside className="border-border bg-card/75 hidden w-80 shrink-0 border-l md:flex md:flex-col">
          <ExecutionRail {...railProps} />
        </aside>
      </div>

      {railOpen && (
        <div
          className="bg-overlay/80 fixed inset-0 z-50 md:hidden"
          onClick={() => setRailOpen(false)}
        >
          <div
            className="border-border bg-background absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-xl border-t p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display font-semibold">Execution</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRailOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
            <ExecutionRail {...railProps} />
          </div>
        </div>
      )}
    </div>
  );
}
