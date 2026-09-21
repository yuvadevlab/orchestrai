"use client";

/**
 * @file use-conversations.ts
 * @description Custom React hook fetching conversation sessions from Gateway API.
 * @module apps/console/features/conversations/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { Conversation as ConsoleConversation } from "@/lib/types";
import type { Conversation as SdkConversation } from "@orchestrai/sdk";

/**
 * Custom React hook querying active conversations from Gateway REST API.
 *
 * @returns Query result containing conversations list, loading state, error, and refetch handler.
 */
export function useConversations(): UseApiDataResult<ConsoleConversation[]> {
  return useApiData<ConsoleConversation[]>({
    fetchFn: async (client): Promise<ConsoleConversation[]> => {
      const response = await client.conversations.list();
      const items: SdkConversation[] = response?.items ?? [];

      return items.map((c: SdkConversation): ConsoleConversation => ({
        id: c.conversationId,
        title: c.title || "Conversation Thread",
        agent: "General Agent",
        agentId: "general",
        lastMessage: "No messages yet.",
        lastActivity: c.updatedAt || new Date().toISOString(),
        status: "active",
        messages: [],
      }));
    },
    initialData: [],
  });
}
