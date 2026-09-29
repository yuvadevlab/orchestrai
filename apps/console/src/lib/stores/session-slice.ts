/**
 * @file apps/console/src/lib/stores/session-slice.ts
 * @description Zustand store slice managing conversation thread state, messages, and streaming deltas.
 * @module apps/console/lib/stores
 */

import type { StateCreator } from "zustand";
import type { MessageRole } from "@orchestrai/shared-types";

/**
 * Chat message representation in the session feed.
 */
export interface ConsoleMessage {
  readonly id: string;
  readonly role: MessageRole | string;
  readonly content: string;
  readonly timestamp: number;
  readonly thinking?: string;
  readonly isComplete?: boolean;
}

/**
 * State and actions for conversation thread and message streaming.
 */
export interface SessionSlice {
  activeSessionId: string | null;
  messages: ConsoleMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
  selectedAgentId: string | null;

  setActiveSessionId: (id: string | null) => void;
  setMessages: (messages: ConsoleMessage[]) => void;
  appendMessage: (message: ConsoleMessage) => void;
  updateMessage: (id: string, patch: Partial<ConsoleMessage>) => void;
  setStreamingState: (isStreaming: boolean, messageId?: string | null) => void;
  appendStreamingDelta: (delta: string) => void;
  finalizeStreaming: (finalContent?: string) => void;
  setSelectedAgentId: (agentId: string | null) => void;
  clearSession: () => void;
}

export const createSessionSlice: StateCreator<SessionSlice, [], [], SessionSlice> = (set) => ({
  activeSessionId: null,
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  streamingContent: "",
  selectedAgentId: null,

  setActiveSessionId: (id) => set({ activeSessionId: id }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  setStreamingState: (isStreaming, messageId = null) =>
    set({ isStreaming, streamingMessageId: messageId, streamingContent: "" }),
  appendStreamingDelta: (delta) =>
    set((state) => ({ streamingContent: state.streamingContent + delta })),
  finalizeStreaming: (finalContent) =>
    set((state) => {
      const content = finalContent ?? state.streamingContent;
      const msgId = state.streamingMessageId;
      if (!msgId) {
        return { isStreaming: false, streamingMessageId: null, streamingContent: "" };
      }
      return {
        isStreaming: false,
        streamingMessageId: null,
        streamingContent: "",
        messages: state.messages.map((m) =>
          m.id === msgId ? { ...m, content, isComplete: true } : m,
        ),
      };
    }),
  setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),
  clearSession: () =>
    set({
      messages: [],
      isStreaming: false,
      streamingMessageId: null,
      streamingContent: "",
    }),
});
