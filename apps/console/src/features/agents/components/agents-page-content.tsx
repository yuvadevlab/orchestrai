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
import { EmptyState } from "@/components/ui";
import { PageShell } from "@/components/layout/page-shell";

export function AgentsPageContent(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: agentList, isLoading, error, refetch } = useAgents();

  const activeCount = agentList.filter((a) => a.status === "ACTIVE").length;

  // Dynamically extract domains/roles from registered agents
  const domains = ["All", ...Array.from(new Set(agentList.map((a) => a.role).filter(Boolean)))];

  const filteredAgents = agentList.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.role.toLowerCase().includes(search.toLowerCase()) ||
      agent.model.toLowerCase().includes(search.toLowerCase());

    const matchesDomain =
      selectedDomain === "All" || agent.role.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  return (
    <PageShell
      title="Agents & Specialists"
      breadcrumb="Agents"
      stats={`${activeCount}/${agentList.length} active`}
      description="The specialists your orchestrator can delegate to."
      actions={
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>New agent</span>
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)}
              placeholder="Search agents by name, model, role..."
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
          <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-md border backdrop-blur">
            <span className="text-muted-foreground animate-pulse text-xs">
              Fetching cluster agents from gateway...
            </span>
          </div>
        ) : error ? (
          <div className="border-border bg-card flex flex-col items-center justify-center gap-2 rounded-md border p-6 text-center">
            <p className="text-foreground text-xs font-medium">Failed to load cluster agents</p>
            <p className="text-muted-foreground max-w-md text-xs">{error.message}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              className="mt-2 h-7 cursor-pointer text-xs"
            >
              Retry
            </Button>
          </div>
        ) : agentList.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No Agents Registered"
            description="There are currently no active or configured agent specifications in the OrchestrAI cluster registry."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="h-8 cursor-pointer text-xs"
              >
                <Plus className="mr-1.5 size-3.5" /> Register First Agent
              </Button>
            }
          />
        ) : filteredAgents.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Agents Matched"
            description={`No agents in the cluster registry matched your search query "${search}".`}
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
