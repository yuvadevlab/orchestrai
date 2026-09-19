"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { conversations } from "@/lib/mock-db";

/**
 * Conversations management screen for operator-agent multi-turn threads.
 */
export default function ConversationsPage(): React.JSX.Element {
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const selected = conversations.find((item) => item.id === selectedId) ?? conversations[0];

  return (
    <PageShell
      title="Conversations"
      breadcrumb="Conversations"
      description="Intent threads. Each one can be resumed in the console with its execution context intact."
    >
      <div className="grid gap-3 lg:grid-cols-[20rem_1fr]">
        {/* Left Thread List */}
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={cn(
                "border-border bg-card hover:border-primary/40 w-full rounded-lg border p-3 text-left transition-colors",
                conversation.id === selected?.id && "border-primary/50 bg-primary/5 shadow-sm",
              )}
            >
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-xs font-medium">{conversation.title}</p>
                <StatusChip status={conversation.status} />
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px]">
                {conversation.lastMessage}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                {conversation.agent} · {conversation.lastActivity}
              </p>
            </button>
          ))}
        </div>

        {/* Right Message History Panel */}
        <Panel title={selected?.title ?? "Conversation"} meta={selected?.id ?? ""}>
          <div className="space-y-3">
            {selected?.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-184 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
                  message.role === "user"
                    ? "border-border bg-secondary ml-auto"
                    : "border-primary/25 bg-primary/5",
                )}
              >
                <p className="text-muted-foreground mb-1 font-mono text-[10px]">
                  {message.role === "user" ? "operator" : selected.agent} · {message.at}
                </p>
                <p className="text-foreground whitespace-pre-line">{message.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
