"use client";

/**
 * @file apps/console/src/features/context/context-hub-page-content.tsx
 * @description Unified Context Hub consolidating RAG knowledge documents and agent episodic memories.
 * @module apps/console/features/context
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, Brain } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/utils";
import { KnowledgePageContent } from "@/features/knowledge";
import { MemoryPageContent } from "@/features/memory";
import { useKnowledgeDocuments } from "@/features/knowledge/api";
import { useMemories } from "@/features/memory/api";
import { UI_COPY } from "@/lib/ui-copy";
import { ConsoleQueryParamKey, ConsoleRoutePath } from "@/lib/auth/types";

export enum ContextTab {
  KNOWLEDGE = "knowledge",
  MEMORY = "memory",
}

/**
 * Unified Context Hub page content providing tabbed management of RAG documents and persistent memories.
 */
export function ContextHubPageContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get(ConsoleQueryParamKey.TAB);
  const initialTab = rawTab === ContextTab.MEMORY ? ContextTab.MEMORY : ContextTab.KNOWLEDGE;
  const [activeTab, setActiveTab] = useState<ContextTab>(initialTab);

  const { data: documents = [] } = useKnowledgeDocuments();
  const { data: memories = [] } = useMemories();

  useEffect(() => {
    const tabParam = searchParams.get(ConsoleQueryParamKey.TAB);
    if (tabParam === ContextTab.KNOWLEDGE || tabParam === ContextTab.MEMORY) {
      setActiveTab(tabParam as ContextTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ContextTab): void => {
    setActiveTab(tab);
    const targetUrl = new URL(ConsoleRoutePath.CONTEXT, "http://localhost");
    targetUrl.searchParams.set(ConsoleQueryParamKey.TAB, tab);
    router.replace(`${targetUrl.pathname}${targetUrl.search}`);
  };

  const activeStats =
    activeTab === ContextTab.KNOWLEDGE
      ? UI_COPY.KNOWLEDGE.STATS(documents.length)
      : UI_COPY.MEMORY.STATS(memories.length);

  return (
    <PageShell
      title={UI_COPY.CONTEXT.PAGE_TITLE}
      breadcrumb={UI_COPY.CONTEXT.BREADCRUMB}
      description={UI_COPY.CONTEXT.PAGE_DESCRIPTION}
      stats={activeStats}
      extraRows={[
        <div key="context-hub-tabs" className="orch-header-tabs">
          <button
            type="button"
            onClick={() => handleTabChange(ContextTab.KNOWLEDGE)}
            className={cn("orch-header-tab", activeTab === ContextTab.KNOWLEDGE && "is-active")}
          >
            <BookOpen />
            <span>{UI_COPY.CONTEXT.TAB_KNOWLEDGE}</span>
            {documents.length > 0 && (
              <span className="orch-header-tab__count">{documents.length}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange(ContextTab.MEMORY)}
            className={cn("orch-header-tab", activeTab === ContextTab.MEMORY && "is-active")}
          >
            <Brain />
            <span>{UI_COPY.CONTEXT.TAB_MEMORY}</span>
            {memories.length > 0 && (
              <span className="orch-header-tab__count">{memories.length}</span>
            )}
          </button>
        </div>,
      ]}
    >
      {activeTab === ContextTab.KNOWLEDGE ? (
        <KnowledgePageContent hideShell />
      ) : (
        <MemoryPageContent hideShell />
      )}
    </PageShell>
  );
}
