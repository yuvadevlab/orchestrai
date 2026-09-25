"use client";

/**
 * @file use-session-store.ts
 * @description State hook managing live cowork sessions with URL routing and database sync.
 * @module apps/console/features/studio/hooks
 */

import { useCallback, useEffect, useState } from "react";
import { getApiClient } from "@/lib/api-client";
import type { CoworkMessage, CoworkSession } from "../types";
import {
  createDraftSession,
  fetchServerSessionMessages,
  fetchServerSessions,
  loadCachedSessions,
  saveCachedSessions,
} from "./session-storage";
import { applyMessageUpdate, applyMetaUpdate, applySessionDelete } from "./session-transitions";

export interface UseSessionStoreResult {
  sessions: CoworkSession[];
  activeSession: CoworkSession;
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  createNewSession: () => CoworkSession;
  updateActiveMessages: (updater: (prev: CoworkMessage[]) => CoworkMessage[]) => void;
  updateSessionMeta: (
    updates: Partial<Pick<CoworkSession, "title" | "specialistId" | "model" | "mode">>,
  ) => void;
  deleteSession: (id: string) => void;
}

/**
 * Live session manager connecting Cowork Studio to PostgreSQL and URL-driven routing.
 */
export function useSessionStore(routeSessionId?: string): UseSessionStoreResult {
  const [sessions, setSessions] = useState<CoworkSession[]>(() => loadCachedSessions());
  const [activeSessionId, setActiveSessionIdState] = useState<string>(() => routeSessionId || "");
  const [draftSession, setDraftSession] = useState<CoworkSession>(() =>
    createDraftSession(routeSessionId),
  );

  // Synchronize active session with URL route parameter
  useEffect(() => {
    let cancelled = false;

    // Load from local cache for instant UI rendering
    const cached = loadCachedSessions();
    if (cached.length > 0) {
      setSessions(cached);
    }

    if (routeSessionId) {
      // URL has an ID: lock active session to this specific thread
      setActiveSessionIdState(routeSessionId);
    } else {
      // URL has NO ID (root /): always start on a fresh new thread
      const freshDraft = createDraftSession();
      setDraftSession(freshDraft);
      setActiveSessionIdState(freshDraft.id);
    }

    // Fetch full conversation history from PostgreSQL via Gateway API
    void fetchServerSessions().then((serverSessions) => {
      if (cancelled) return;

      if (serverSessions.length > 0) {
        setSessions(serverSessions);
        saveCachedSessions(serverSessions);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [routeSessionId]);

  // Load thread messages on demand if active session has no messages loaded
  useEffect(() => {
    if (!activeSessionId) return;
    const targetSession = sessions.find((s) => s.id === activeSessionId);
    if (!targetSession || targetSession.messages.length === 0) {
      void fetchServerSessionMessages(activeSessionId).then((messages) => {
        if (messages.length > 0) {
          setSessions((prev) => {
            const exists = prev.some((s) => s.id === activeSessionId);
            if (exists) {
              return prev.map((s) => (s.id === activeSessionId ? { ...s, messages } : s));
            }
            const fallback: CoworkSession = {
              id: activeSessionId,
              title: messages[0]?.content ? messages[0].content.slice(0, 36) : "Thread",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              specialistId: "",
              mode: "auto",
              messages,
            };
            return [fallback, ...prev];
          });
        }
      });
    }
  }, [activeSessionId, sessions]);

  const setActiveSessionId = useCallback((id: string) => {
    setActiveSessionIdState(id);
  }, []);

  const createNewSession = useCallback((): CoworkSession => {
    const freshDraft = createDraftSession();
    setDraftSession(freshDraft);
    setActiveSessionIdState(freshDraft.id);
    return freshDraft;
  }, []);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ||
    (draftSession.id === activeSessionId ? draftSession : createDraftSession(activeSessionId));

  const updateActiveMessages = useCallback(
    (updater: (prev: CoworkMessage[]) => CoworkMessage[]) => {
      setSessions((prev) => {
        const next = applyMessageUpdate(prev, activeSessionId, draftSession, updater);
        saveCachedSessions(next);
        return next;
      });
    },
    [activeSessionId, draftSession],
  );

  const updateSessionMeta = useCallback(
    (updates: Partial<Pick<CoworkSession, "title" | "specialistId" | "model" | "mode">>) => {
      setDraftSession((prev) => (prev.id === activeSessionId ? { ...prev, ...updates } : prev));
      setSessions((prev) => {
        const next = applyMetaUpdate(prev, activeSessionId, updates);
        saveCachedSessions(next);
        return next;
      });

      try {
        const client = getApiClient();
        void client.conversations.update(activeSessionId, {
          title: updates.title,
          metadata: {
            specialistId: updates.specialistId,
            model: updates.model,
            mode: updates.mode,
          },
        });
      } catch {
        // Non-blocking background sync
      }
    },
    [activeSessionId],
  );

  const deleteSession = useCallback(
    (idToDelete: string) => {
      setSessions((prev) => {
        const result = applySessionDelete(prev, idToDelete, activeSessionId);
        saveCachedSessions(result.remaining);

        if (result.nextActiveId) {
          setActiveSessionIdState(result.nextActiveId);
        } else if (result.needFreshDraft) {
          const fresh = createDraftSession();
          setDraftSession(fresh);
          setActiveSessionIdState(fresh.id);
        }
        return result.remaining;
      });

      try {
        const client = getApiClient();
        void client.conversations.delete(idToDelete);
      } catch {
        // Non-blocking background sync
      }
    },
    [activeSessionId],
  );

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    updateActiveMessages,
    updateSessionMeta,
    deleteSession,
  };
}
