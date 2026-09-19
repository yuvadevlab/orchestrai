"use client";

import React, { useState } from "react";
import { AgentCard } from "./components/agent-card";
import { MOCK_AGENTS } from "./mock-agents";
import { Input, Button, Badge } from "@yuva-devlab/ui";
import { Plus, Search } from "lucide-react";

/**
 * Main Agents Management View.
 * Displays filterable agent cards, capability status, and provisioning triggers.
 */
export function AgentsPageContent(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredAgents = MOCK_AGENTS.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.role.toLowerCase().includes(search.toLowerCase()) ||
      agent.model.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">Agent Registry</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {MOCK_AGENTS.length} Configured
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Manage autonomous agent specifications, prompt boundaries, tool attachments, and routing
            models.
          </p>
        </div>

        <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Provision Agent</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
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
              className="h-7 px-2.5 font-mono text-xs"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
