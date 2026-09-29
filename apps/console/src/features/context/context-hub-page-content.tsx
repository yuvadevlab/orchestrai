"use client";

/**
 * @file apps/console/src/features/context/context-hub-page-content.tsx
 * @description Unified Context Hub consolidating RAG knowledge documents and agent episodic memories.
 * @module apps/console/features/context
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, Brain, Layers } from "lucide-react";
import { KnowledgePageContent } from "@/features/knowledge";
import { MemoryPageContent } from "@/features/memory";

type ContextTab = "knowledge" | "memory";

/**
 * Unified Context Hub page content providing tabbed management of RAG documents and persistent memories.
 */
export function ContextHubPageContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as ContextTab) || "knowledge";
  const [activeTab, setActiveTab] = useState<ContextTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as ContextTab;
    if (tabParam && (tabParam === "knowledge" || tabParam === "memory")) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ContextTab): void => {
    setActiveTab(tab);
    router.replace(`/context?tab=${tab}`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Sub-header Navigation Rail */}
      <div className="border-border/60 bg-card/40 flex items-center justify-between border-b px-6 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="text-primary size-4" />
            <span className="text-sm font-semibold tracking-tight">Context Hub</span>
          </div>
          <div className="bg-muted/40 border-border/60 flex rounded-md border p-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleTabChange("knowledge")}
              className={`flex items-center gap-1.5 rounded px-3 py-1 font-medium transition-colors ${
                activeTab === "knowledge"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>RAG Knowledge Base</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("memory")}
              className={`flex items-center gap-1.5 rounded px-3 py-1 font-medium transition-colors ${
                activeTab === "memory"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain className="size-3.5" />
              <span>Episodic & Semantic Memory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Tab View */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "knowledge" ? <KnowledgePageContent /> : <MemoryPageContent />}
      </div>
    </div>
  );
}
