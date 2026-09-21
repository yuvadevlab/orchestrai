"use client";

/**
 * @file agents-page-content.tsx
 * @description Agent Registry page displaying live cluster agent definitions with cybernetic theme and modal creation.
 * @module apps/console/features/agents/components
 */

import React, { useState } from "react";
import { AgentCard } from "./agent-card";
import { AgentDialog } from "./agent-dialog";
import { Input, Button, Badge } from "@yuva-devlab/ui";
import { Plus, Search, Bot } from "lucide-react";
import { useAgents } from "../api";
import { EmptyState } from "@/components/ui";

export function AgentsPageContent(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: agentList, isLoading, refetch } = useAgents();

  const filteredAgents = agentList.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.role.toLowerCase().includes(search.toLowerCase()) ||
      agent.model.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">Agent Registry</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {agentList.length} Configured
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Manage autonomous agent specifications, prompt boundaries, tool attachments, and routing
            models.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>Provision Agent</span>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
          <Input
            value={search}
            onChange={(e): void => setSearch(e.target.value)}
            placeholder="Search agents by name, model, role..."
            className="bg-card h-8 pl-8 font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {["ALL", "ACTIVE", "IDLE"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={(): void => setStatusFilter(s)}
              className="h-7 cursor-pointer px-2.5 font-mono text-xs"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Fetching cluster agents from gateway...
          </span>
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
              className="h-8 cursor-pointer font-mono text-xs"
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
  );
}
