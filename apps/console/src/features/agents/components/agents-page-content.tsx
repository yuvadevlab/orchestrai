/**
 * @file agents-page-content.tsx
 * @description Agent Registry page displaying live cluster agent definitions.
 * @module apps/console/features/agents/components
 */

"use client";

import React, { useState } from "react";
import { AgentCard } from "./agent-card";
import { AgentDialog } from "./agent-dialog";
import { Input, Button } from "@orchestrai/ui";
import { Plus, Search, Bot } from "lucide-react";
import { useAgents } from "../api";
import { AgentStatus } from "../types";
import { EmptyState, CardGridSkeleton } from "@orchestrai/ui";
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
          style={{
            height: "2rem",
            cursor: "pointer",
            gap: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>{UI_COPY.AGENTS.REGISTER_BUTTON}</span>
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div style={{ width: "18rem", maxWidth: "100%" }}>
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)}
              placeholder={UI_COPY.AGENTS.SEARCH_PLACEHOLDER}
              startIcon={<Search style={{ width: "0.875rem", height: "0.875rem" }} />}
              style={{ height: "2rem", fontSize: "0.75rem" }}
            />
          </div>

          {/* Domain Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.375rem" }}>
            {domains.map((d) => (
              <Button
                key={d}
                variant={selectedDomain.toLowerCase() === d.toLowerCase() ? "default" : "outline"}
                size="sm"
                onClick={(): void => setSelectedDomain(d)}
                style={{
                  height: "1.75rem",
                  cursor: "pointer",
                  borderRadius: "9999px",
                  paddingInline: "0.75rem",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                }}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : error ? (
          <div
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              borderRadius: "var(--radius-md, 0.375rem)",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "var(--foreground)",
                fontSize: "0.75rem",
                fontWeight: 500,
                margin: 0,
              }}
            >
              {UI_COPY.AGENTS.ERROR_TITLE}
            </p>
            <p
              style={{
                color: "var(--mutedForeground)",
                maxWidth: "28rem",
                fontSize: "0.75rem",
                margin: 0,
              }}
            >
              {error.message}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              style={{
                marginTop: "0.5rem",
                height: "1.75rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
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
                style={{ height: "2rem", cursor: "pointer", fontSize: "0.75rem" }}
              >
                <Plus style={{ marginRight: "0.375rem", width: "0.875rem", height: "0.875rem" }} />{" "}
                {UI_COPY.AGENTS.REGISTER_BUTTON}
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
          <div className="orch-agent-grid">
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
