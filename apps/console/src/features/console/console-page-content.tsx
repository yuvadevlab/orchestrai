"use client";

import React, { useState } from "react";
import { ConsoleHeader } from "./components/console-header";
import { PromptBar } from "./components/prompt-bar";
import { EventStream } from "./components/event-stream";
import { AgentOutputCard } from "./components/agent-output-card";
import { DEMO_SCENARIOS, DEFAULT_TELEMETRY } from "./mock-data";
import type { DemoType, ExecutionEvent } from "./types";

/**
 * Main Content View for the Agent Execution Console.
 * Orchestrates prompt submission, interactive DAG event progression, and response display.
 */
export function ConsolePageContent(): React.JSX.Element {
  const [selectedDemo, setSelectedDemo] = useState<DemoType>("research");
  const [prompt, setPrompt] = useState<string>(DEMO_SCENARIOS.research.prompt);
  const [events, setEvents] = useState<ExecutionEvent[]>(DEMO_SCENARIOS.research.events);
  const [response, setResponse] = useState<string>(DEMO_SCENARIOS.research.response);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleSelectDemo = (demo: DemoType): void => {
    setSelectedDemo(demo);
    setPrompt(DEMO_SCENARIOS[demo].prompt);
    setEvents(DEMO_SCENARIOS[demo].events);
    setResponse(DEMO_SCENARIOS[demo].response);
    setIsRunning(false);
  };

  const handleReset = (): void => {
    setEvents([]);
    setResponse("");
    setIsRunning(false);
  };

  const handleTriggerRun = (): void => {
    setIsRunning(true);
    setEvents([]);
    setResponse("");

    const targetScenario = DEMO_SCENARIOS[selectedDemo];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < targetScenario.events.length) {
        const nextEvent = targetScenario.events[currentIndex];
        if (nextEvent) {
          setEvents((prev) => [...prev, nextEvent]);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        setResponse(targetScenario.response);
        setIsRunning(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Console Summary Header */}
      <ConsoleHeader
        telemetry={DEFAULT_TELEMETRY}
        isRunning={isRunning}
        onReset={handleReset}
        onTriggerRun={handleTriggerRun}
      />

      {/* Prompt Composer */}
      <PromptBar
        prompt={prompt}
        selectedDemo={selectedDemo}
        isRunning={isRunning}
        onPromptChange={setPrompt}
        onSelectDemo={handleSelectDemo}
        onSubmit={handleTriggerRun}
      />

      {/* Split Execution View */}
      <div className="grid min-h-115 grid-cols-1 gap-6 lg:grid-cols-2">
        <EventStream events={events} isRunning={isRunning} />
        <AgentOutputCard response={response} isRunning={isRunning} />
      </div>
    </div>
  );
}
