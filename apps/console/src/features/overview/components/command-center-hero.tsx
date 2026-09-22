"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@yuva-devlab/ui";

const LIFECYCLE = [
  "intent",
  "understand",
  "plan",
  "orchestrate",
  "delegate",
  "execute",
  "observe",
  "adapt",
  "complete",
] as const;

const SUGGESTIONS = [
  "Research PostgreSQL indexing strategies for high-write applications.",
  "Review my API architecture.",
  "Analyze this software architecture and research better alternatives.",
] as const;

/**
 * Command Center hero section featuring dynamic lifecycle status,
 * prompt dispatcher, and quick-start orchestration suggestions.
 */
export function CommandCenterHero(): React.JSX.Element {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % LIFECYCLE.length);
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (prompt.trim()) {
      router.push(`/console?prompt=${encodeURIComponent(prompt.trim())}`);
    } else {
      router.push("/console");
    }
  };

  return (
    <section className="pt-6 md:pt-12">
      {/* Dynamic Lifecycle Phase Indicator */}
      <p className="text-primary font-mono text-[10px] tracking-[0.22em] uppercase transition-all duration-300">
        {LIFECYCLE[phase]}
      </p>

      <h1 className="font-display mt-3 text-3xl leading-tight font-semibold md:text-5xl">
        What should I accomplish?
      </h1>

      <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
        State an objective. The orchestrator interprets intent, plans the work, delegates to
        specialists and reports back with evidence.
      </p>

      {/* Glassmorphic Prompt Input Form */}
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card/80 mt-7 rounded-xl border p-2 backdrop-blur"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Analyze this software architecture and research better alternatives."
          className="placeholder:text-muted-foreground w-full resize-none bg-transparent px-3 py-2 text-sm outline-none"
        />
        <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
          <span className="text-muted-foreground font-mono text-[10px]">
            supervisor · qwen-8b · 5 agents ready
          </span>
          <Button type="submit" size="sm" className="ml-auto gap-1.5 font-semibold">
            <Sparkles className="size-3.5" />
            Orchestrate
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </form>

      {/* Quick Suggestion Pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setPrompt(suggestion)}
            className="border-border bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground rounded-md border px-2.5 py-1.5 text-left text-[11px] transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
