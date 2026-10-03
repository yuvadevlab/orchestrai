/**
 * @file agents-page-content.tsx
 * @description Agent Registry page displaying live cluster agent definitions.
 * @module apps/console/features/agents/components
 */

"use client";

import React, { useState } from "react";
import { AgentCard } from "./agent-card";
import { AgentDialog } from "./agent-dialog";
import { Input, Button } from "@yuva-devlab/ui";
import { Plus, Search, Bot } from "lucide-react";
import { useAgents } from "../api";
import { AgentStatus } from "../types";
import { EmptyState, CardGridSkeleton } from "@/components/ui";
import { PageShell } from "@/components/layout/page-shell";
import { UI_COPY } from "@/lib/ui-copy";

export function AgentsPageContent(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>(UI_COPY.AGENTS.FILTER_ALL);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: agentList, isLoading, error, refetch } = useAgents();

  const activeCount = agentList.filter((a) => a.status === AgentStatus.ACTIVE).length;

  // Dynamically extract domains/roles from registered agents
  const domains = [
    UI_COPY.AGENTS.FILTER_ALL,
    ...Array.from(new Set(agentList.map((a) => a.role).filter(Boolean))),
  ];

  const filteredAgents = agentList.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.role.toLowerCase().includes(search.toLowerCase()) ||
      agent.model.toLowerCase().includes(search.toLowerCase());

    const matchesDomain =
      selectedDomain === UI_COPY.AGENTS.FILTER_ALL ||
      agent.role.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  return (
    <PageShell
      title={UI_COPY.AGENTS.PAGE_TITLE}
      breadcrumb={UI_COPY.AGENTS.BREADCRUMB}
      stats={UI_COPY.AGENTS.ACTIVE_STATS(activeCount, agentList.length)}
      description={UI_COPY.AGENTS.PAGE_DESCRIPTION}
      actions={
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>{UI_COPY.AGENTS.REGISTER_BUTTON}</span>
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)}
              placeholder={UI_COPY.AGENTS.SEARCH_PLACEHOLDER}
              startIcon={<Search className="size-3.5" />}
              className="bg-card h-8 text-xs"
            />
          </div>

          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            {domains.map((d) => (
              <Button
                key={d}
                variant={selectedDomain.toLowerCase() === d.toLowerCase() ? "default" : "outline"}
                size="sm"
                onClick={(): void => setSelectedDomain(d)}
                className="h-7 cursor-pointer rounded-full px-3 text-xs capitalize"
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : error ? (
          <div className="border-border bg-card flex flex-col items-center justify-center gap-2 rounded-md border p-6 text-center">
            <p className="text-foreground text-xs font-medium">{UI_COPY.AGENTS.ERROR_TITLE}</p>
            <p className="text-muted-foreground max-w-md text-xs">{error.message}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              className="mt-2 h-7 cursor-pointer text-xs"
            >
              {UI_COPY.AGENTS.RETRY_BUTTON}
            </Button>
          </div>
        ) : agentList.length === 0 ? (
          <EmptyState
            icon={Bot}
            title={UI_COPY.AGENTS.EMPTY_TITLE}
            description={UI_COPY.AGENTS.EMPTY_DESC}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="h-8 cursor-pointer text-xs"
              >
                <Plus className="mr-1.5 size-3.5" /> {UI_COPY.AGENTS.REGISTER_BUTTON}
              </Button>
            }
          />
        ) : filteredAgents.length === 0 ? (
          <EmptyState
            icon={Search}
            title={UI_COPY.AGENTS.NO_MATCH_TITLE}
            description={UI_COPY.AGENTS.NO_MATCH_DESC(search)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        <AgentDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      </div>
    </PageShell>
  );
}
