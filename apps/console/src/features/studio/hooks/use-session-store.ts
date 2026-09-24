"use client";

/**
 * @file use-session-store.ts
 * @description State hook managing live cowork sessions without phantom default data.
 * @module apps/console/features/studio/hooks
 */

import { useCallback, useEffect, useState } from "react";
import type { CoworkMessage, CoworkSession } from "../types";

const SESSIONS_STORAGE_KEY = "orchestrai_cowork_sessions";
const ACTIVE_SESSION_STORAGE_KEY = "orchestrai_active_session_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
    const r =
      typeof crypto !== "undefined"
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : Math.floor(Math.random() * 16);
    return (+c ^ ((r ?? 0) & (15 >> (+c / 4)))).toString(16);
  });
}

function createDraftSession(id?: string): CoworkSession {
  const sessionId = id || generateUUID();
  const now = new Date().toISOString();
  return {
    id: sessionId,
    title: "New Thread",
    createdAt: now,
    updatedAt: now,
    specialistId: "",
    model: "",
    mode: "auto",
    messages: [],
  };
}

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
 * Live session manager that only displays and persists sessions with actual message history.
 */
export function useSessionStore(routeSessionId?: string): UseSessionStoreResult {
  const [sessions, setSessions] = useState<CoworkSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string>("");
  const [draftSession, setDraftSession] = useState<CoworkSession>(() =>
    createDraftSession(routeSessionId),
  );

  // Load only genuine sessions with messages from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed: CoworkSession[] = JSON.parse(stored);
        // Only keep sessions that have real messages
        const validSessions = Array.isArray(parsed)
          ? parsed.filter((s) => Array.isArray(s.messages) && s.messages.length > 0)
          : [];

        setSessions(validSessions);
        // Clean up localStorage to remove ghost 0-msg sessions
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(validSessions));

        if (validSessions.length > 0) {
          const storedActiveId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
          const initialId = routeSessionId || storedActiveId || validSessions[0]?.id || "";
          const matching = validSessions.find((s) => s.id === initialId);

          if (matching?.id) {
            setActiveSessionIdState(matching.id);
            return;
          }
        }
      }
    } catch {
      // Storage parse fallback
    }

    const freshDraft = createDraftSession(routeSessionId);
    setDraftSession(freshDraft);
    setActiveSessionIdState(freshDraft.id);
  }, [routeSessionId]);

  const setActiveSessionId = useCallback((id: string) => {
    setActiveSessionIdState(id);
    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, id);
    } catch {
      // Storage quota exception guard
    }
  }, []);

  const createNewSession = useCallback((): CoworkSession => {
    const freshDraft = createDraftSession();
    setDraftSession(freshDraft);
    setActiveSessionIdState(freshDraft.id);
    return freshDraft;
  }, []);

  // Compute active session from saved sessions or transient in-memory draft
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ||
    (draftSession.id === activeSessionId ? draftSession : createDraftSession(activeSessionId));

  const updateActiveMessages = useCallback(
    (updater: (prev: CoworkMessage[]) => CoworkMessage[]) => {
      setSessions((prev) => {
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

        // Auto-title from initial prompt
        if (
          (newTitle === "New Thread" || newTitle === "New Cowork Session") &&
          newMessages.length > 0
        ) {
          const firstUser = newMessages.find((m) => m.role === "user");
          if (firstUser) {
            newTitle =
              firstUser.content.slice(0, 36) + (firstUser.content.length > 36 ? "..." : "");
          }
        }

        const updatedSession: CoworkSession = {
          ...currentSession,
          title: newTitle,
          messages: newMessages,
          updatedAt: new Date().toISOString(),
        };

        // Only retain and persist sessions that contain messages
        let nextSessions: CoworkSession[];
        if (existingIndex >= 0) {
          nextSessions = prev.map((s, idx) => (idx === existingIndex ? updatedSession : s));
        } else if (newMessages.length > 0) {
          nextSessions = [updatedSession, ...prev];
        } else {
          nextSessions = prev;
        }

        const validOnly = nextSessions.filter((s) => s.messages.length > 0);
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(validOnly));
        } catch {
          // Storage quota guard
        }
        return validOnly;
      });
    },
    [activeSessionId, draftSession],
  );

  const updateSessionMeta = useCallback(
    (updates: Partial<Pick<CoworkSession, "title" | "specialistId" | "model" | "mode">>) => {
      setDraftSession((prev) => (prev.id === activeSessionId ? { ...prev, ...updates } : prev));
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === activeSessionId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s,
        );
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Storage quota guard
        }
        return updated;
      });
    },
    [activeSessionId],
  );

  const deleteSession = useCallback(
    (idToDelete: string) => {
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== idToDelete);
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(remaining));
        } catch {
          // Storage quota guard
        }
        if (activeSessionId === idToDelete) {
          if (remaining.length > 0 && remaining[0]?.id) {
            setActiveSessionIdState(remaining[0].id);
          } else {
            const fresh = createDraftSession();
            setDraftSession(fresh);
            setActiveSessionIdState(fresh.id);
          }
        }
        return remaining;
      });
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
