"use client";

/**
 * OrchestrAI Live Agent Console. Full-screen terminal-style layout:
 * Header (shrink-0) → body row → main (intent + topology + event-log) + aside rail.
 * Only the event log section scrolls. Everything else is fixed height.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@yuva-devlab/ui";
import { X } from "lucide-react";
import { ConsoleHeader } from "@/features/console/console-header";
import { ExecutionTopology } from "@/features/console/console-topology";
import { ConsoleEventLog } from "@/features/console/console-event-log";
import { ExecutionRail } from "@/features/console/execution-rail";
import { DEMOS } from "@/features/console/console-demo-data";
import type { Demo, EventStatus } from "@/features/console/console-demo-data";

export default function ConsolePage(): React.JSX.Element {
  const [demo, setDemo] = useState<Demo>("multi");
  const [prompt, setPrompt] = useState(DEMOS.multi.prompt);
  const [visibleCount, setVisibleCount] = useState(5);
  const [running, setRunning] = useState(true);
  const [approved, setApproved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [newActivity, setNewActivity] = useState(false);
  const activityRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);

  const config = DEMOS[demo];
  const approvalIndex = demo === "multi" ? 4 : -1;
  const isBlocked = approvalIndex >= 0 && visibleCount > approvalIndex && !approved;
  const completed = visibleCount >= config.events.length && !isBlocked;

  useEffect(() => {
    if (!running || completed || isBlocked) return;
    const timer = window.setTimeout(
      () => setVisibleCount((c) => Math.min(c + 1, config.events.length)),
      1250,
    );
    return () => window.clearTimeout(timer);
  }, [completed, config.events.length, isBlocked, running, visibleCount]);

  useEffect(() => {
    const el = activityRef.current;
    if (!el) return;
    if (followingRef.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else setNewActivity(true);
  }, [visibleCount]);

  const currentEvent = config.events[Math.min(visibleCount - 1, config.events.length - 1)];
  const progress = Math.round((visibleCount / config.events.length) * 100);
  const responseWords = Math.max(
    0,
    Math.round(((visibleCount - 4) / 3) * config.response.split(" ").length),
  );
  const streamedResponse = config.response.split(" ").slice(0, responseWords).join(" ");
  const elapsed = (visibleCount * 1.7).toFixed(1);

  const metrics = useMemo(
    () => ({
      tokens: (visibleCount * 418).toLocaleString(),
      tools: Math.max(1, visibleCount - 1),
      sources: demo === "research" ? visibleCount * 2 : visibleCount + 2,
    }),
    [demo, visibleCount],
  );

  const startDemo = useCallback((next: Demo, overridePrompt?: string) => {
    setDemo(next);
    setPrompt(overridePrompt ?? DEMOS[next].prompt);
    setVisibleCount(1);
    setApproved(false);
    setExpanded(null);
    setRunning(true);
    setNewActivity(false);
    followingRef.current = true;
  }, []);

  const submitPrompt = useCallback(() => {
    const n = prompt.toLowerCase();
    const inferred: Demo = n.includes("postgres")
      ? "research"
      : n.includes("architecture") && n.includes("alternative")
        ? "multi"
        : "developer";
    startDemo(inferred, prompt);
  }, [prompt, startDemo]);

  const statusFor = useCallback(
    (index: number): EventStatus => {
      if (index === approvalIndex && isBlocked) return "waiting";
      if (index === visibleCount - 1 && !completed) return "active";
      return "done";
    },
    [approvalIndex, completed, isBlocked, visibleCount],
  );

  const railProps = {
    progress,
    current: isBlocked
      ? "Waiting for approval"
      : completed
        ? "Complete"
        : (currentEvent?.title ?? "Routing"),
    metrics,
    elapsed,
    running: running && !completed,
    blocked: isBlocked,
    onStop: () => setRunning(false),
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <ConsoleHeader
        demo={demo}
        prompt={prompt}
        running={running}
        completed={completed}
        isBlocked={isBlocked}
        onPromptChange={setPrompt}
        onSubmit={submitPrompt}
        onStartDemo={startDemo}
        onToggleRunning={() => setRunning((v) => !v)}
        onOpenRail={() => setRailOpen(true)}
      />

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Dot-grid background — pointer-events-none, NOT backdrop-blur */}
          <div className="execution-grid pointer-events-none absolute inset-0 opacity-35" />

          {/* Intent section — shrink-0, never scrolls */}
          <section className="relative shrink-0 px-4 pt-4 pb-3 md:px-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-primary mb-1 font-mono text-[10px] tracking-[0.16em] uppercase">
                  Intent / active run
                </div>
                <h1 className="font-display max-w-3xl text-xl leading-tight font-semibold text-pretty md:text-2xl">
                  {prompt}
                </h1>
                <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                  EXE-8F29A · {demo === "multi" ? "3 agents" : "1 agent"} · adaptive routing
                </p>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                {(
                  [
                    ["text-foreground", "● Active"],
                    ["text-warning", "Ⅱ Approval"],
                    ["text-muted-foreground", "○ Queued"],
                  ] as const
                ).map(([cls, label]) => (
                  <span
                    key={label}
                    className={`border-border bg-secondary rounded border px-2 py-1 ${cls}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Topology — shrink-0, never scrolls */}
          <ExecutionTopology
            demo={demo}
            visibleCount={visibleCount}
            blocked={isBlocked}
            completed={completed}
          />

          {/* Event log — flex-1, ONLY scrollable section */}
          <ConsoleEventLog
            config={config}
            visibleCount={visibleCount}
            running={running}
            completed={completed}
            isBlocked={isBlocked}
            currentEventTitle={currentEvent?.title}
            newActivity={newActivity}
            streamedResponse={streamedResponse}
            responseWords={responseWords}
            expanded={expanded}
            activityRef={activityRef}
            onScroll={(e) => {
              const t = e.currentTarget;
              followingRef.current = t.scrollHeight - t.scrollTop - t.clientHeight < 42;
              if (followingRef.current) setNewActivity(false);
            }}
            onToggleExpand={(id) => setExpanded((v) => (v === id ? null : id))}
            onApprove={() => {
              setApproved(true);
              setRunning(true);
            }}
            onScrollToBottom={() => {
              followingRef.current = true;
              setNewActivity(false);
              activityRef.current?.scrollTo({
                top: activityRef.current.scrollHeight,
                behavior: "smooth",
              });
            }}
            statusFor={statusFor}
          />
        </main>

        {/* Desktop execution rail — 2nd column visible on md and up */}
        <aside className="border-border bg-card/75 hidden w-80 shrink-0 border-l md:flex md:flex-col">
          <ExecutionRail {...railProps} />
        </aside>
      </div>

      {/* Mobile rail sheet (< md) */}
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
