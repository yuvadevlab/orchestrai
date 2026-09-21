"use client";

/**
 * @file conversations-page-content.tsx
 * @description Conversations management view with live API mapping, selection state, and new session creation.
 * @module apps/console/features/conversations/components
 */

import React, { useState } from "react";
import { Panel, StatusChip, Button } from "@yuva-devlab/ui";
import { MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationDialog } from "./conversation-dialog";
import { useConversations } from "../api";
import { EmptyState } from "@/components/ui";

export function ConversationsPageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: conversationList, isLoading, refetch } = useConversations();
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = conversationList.find((item) => item.id === selectedId) ?? conversationList[0];

  if (isLoading) {
    return (
      <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
        <span className="text-muted-foreground animate-pulse font-mono text-xs">
          Loading conversation threads...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-display text-xl font-bold tracking-tight">Conversation Sessions</h1>
          <p className="text-muted-foreground text-xs">
            Multi-turn chat threads, agent messages, and decision logs.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>New Session</span>
        </Button>
      </div>

      {conversationList.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Active Conversations"
          description="Dispatch prompts or interact with agents in the Command Console to open multi-turn threads."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="h-8 cursor-pointer font-mono text-xs"
            >
              <Plus className="mr-1.5 size-3.5" /> Start First Session
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-[20rem_1fr]">
          <div className="space-y-2">
            {conversationList.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className={cn(
                  "border-border bg-card hover:border-primary/40 w-full cursor-pointer rounded-lg border p-3 text-left transition-colors",
                  conversation.id === selected?.id && "border-primary/50 bg-primary/5 shadow-sm",
                )}
              >
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs font-medium">
                    {conversation.title}
                  </p>
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

          {selected && (
            <Panel title={selected.title} meta={selected.id}>
              <div className="space-y-3">
                {(selected.messages ?? []).map((message) => (
                  <div
                    key={message.id || Math.random().toString()}
                    className={cn(
                      "max-w-184 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
                      message.role === "user"
                        ? "border-border bg-secondary ml-auto"
                        : "border-primary/25 bg-primary/5",
                    )}
                  >
                    <p className="text-muted-foreground mb-1 font-mono text-[10px]">
                      {message.role === "user" ? "operator" : selected.agent} ·{" "}
                      {message.at || "now"}
                    </p>
                    <p className="text-foreground whitespace-pre-line">{message.body}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}

      <ConversationDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
