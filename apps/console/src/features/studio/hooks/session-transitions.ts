/**
 * @file session-transitions.ts
 * @description Pure reducer functions for Cowork Studio session state transitions.
 * @module apps/console/features/studio/hooks
 */

import type { CoworkMessage, CoworkSession } from "../types";

/**
 * Computes updated sessions list when messages in the active session change.
 */
export function applyMessageUpdate(
  prev: CoworkSession[],
  activeSessionId: string,
  draftSession: CoworkSession,
  updater: (prevMessages: CoworkMessage[]) => CoworkMessage[],
): CoworkSession[] {
  const existingIndex = prev.findIndex((s) => s.id === activeSessionId);
  const currentSession =
    existingIndex >= 0
      ? prev[existingIndex]
      : draftSession.id === activeSessionId
        ? draftSession
        : null;

  if (!currentSession) return prev;

  const newMessages = updater(currentSession.messages);
  let newTitle = currentSession.title;

  // Derive title from initial user prompt
  if ((newTitle === "New Thread" || newTitle === "New Cowork Session") && newMessages.length > 0) {
    const firstUser = newMessages.find((m) => m.role === "user");
    if (firstUser) {
      newTitle = firstUser.content.slice(0, 36) + (firstUser.content.length > 36 ? "..." : "");
    }
  }

  const updatedSession: CoworkSession = {
    ...currentSession,
    title: newTitle,
    messages: newMessages,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    return prev.map((s, idx) => (idx === existingIndex ? updatedSession : s));
  } else if (newMessages.length > 0) {
    return [updatedSession, ...prev];
  }
  return prev;
}

/**
 * Computes updated sessions list when metadata (title, specialist, model) is modified.
 */
export function applyMetaUpdate(
  prev: CoworkSession[],
  activeSessionId: string,
  updates: Partial<Pick<CoworkSession, "title" | "specialistId" | "model" | "mode">>,
): CoworkSession[] {
  return prev.map((s) =>
    s.id === activeSessionId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s,
  );
}

/**
 * Computes remaining sessions and active ID selection after a session is deleted.
 */
export function applySessionDelete(
  prev: CoworkSession[],
  idToDelete: string,
  activeSessionId: string,
): { remaining: CoworkSession[]; nextActiveId: string | null; needFreshDraft: boolean } {
  const remaining = prev.filter((s) => s.id !== idToDelete);

  if (activeSessionId === idToDelete) {
    if (remaining.length > 0 && remaining[0]?.id) {
      return { remaining, nextActiveId: remaining[0].id, needFreshDraft: false };
    }
    return { remaining, nextActiveId: null, needFreshDraft: true };
  }

  return { remaining, nextActiveId: activeSessionId, needFreshDraft: false };
}
