/**
 * @file apps/realtime/src/connection/connection-registry.ts
 * @description Thread-safe in-memory registry tracking concurrent client sessions and capacity limits.
 */

import { OrchestrAIError } from "@orchestrai/core";
import type { ClientSession } from "./client-session";

export interface ConnectionRegistryStats {
  readonly total: number;
  readonly websocketCount: number;
  readonly sseCount: number;
  readonly authenticatedCount: number;
}

/**
 * Manages the collection of all live client sessions with capacity protection.
 */
export class ConnectionRegistry {
  private readonly sessions = new Map<string, ClientSession>();
  private readonly userSessions = new Map<string, Set<string>>();
  private readonly maxConnections: number;

  public constructor(maxConnections = 10_000) {
    this.maxConnections = maxConnections;
  }

  /**
   * Registers a newly connected client session, verifying server capacity limits.
   */
  public register(session: ClientSession): void {
    // Guard: Prevent server resource exhaustion if max connections reached
    if (this.sessions.size >= this.maxConnections) {
      throw new OrchestrAIError(
        `Server connection limit reached (${this.maxConnections})`,
        "QUEUE_BACKPRESSURE",
        503,
        { current: this.sessions.size, max: this.maxConnections },
      );
    }

    this.sessions.set(session.id, session);

    // Index by userId if user is already authenticated upon connection
    if (session.userId) {
      const userSet = this.userSessions.get(session.userId) ?? new Set();
      userSet.add(session.id);
      this.userSessions.set(session.userId, userSet);
    }
  }

  /**
   * Associates an authenticated user identifier with an existing session.
   */
  public bindUser(sessionId: string, userId: string, tenantId?: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.userId = userId;
    session.tenantId = tenantId;
    session.isAuthenticated = true;

    const userSet = this.userSessions.get(userId) ?? new Set();
    userSet.add(sessionId);
    this.userSessions.set(userId, userSet);
  }

  /**
   * Unregisters a client session and cleans up user indexes.
   */
  public unregister(sessionId: string): ClientSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    this.sessions.delete(sessionId);

    if (session.userId) {
      const userSet = this.userSessions.get(session.userId);
      if (userSet) {
        userSet.delete(sessionId);
        if (userSet.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }
    }

    return session;
  }

  /**
   * Retrieves a session by its unique UUID.
   */
  public get(sessionId: string): ClientSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Returns all active client sessions for a given user ID.
   */
  public getByUserId(userId: string): readonly ClientSession[] {
    const ids = this.userSessions.get(userId);
    if (!ids) {
      return [];
    }
    const result: ClientSession[] = [];
    for (const id of ids) {
      const session = this.sessions.get(id);
      if (session) {
        result.push(session);
      }
    }
    return result;
  }

  /**
   * Returns snapshot statistics on connected client distributions.
   */
  public getStats(): ConnectionRegistryStats {
    let websocketCount = 0;
    let sseCount = 0;
    let authenticatedCount = 0;

    for (const session of this.sessions.values()) {
      if (session.transport === "WEBSOCKET") {
        websocketCount++;
      } else {
        sseCount++;
      }
      if (session.isAuthenticated) {
        authenticatedCount++;
      }
    }

    return {
      total: this.sessions.size,
      websocketCount,
      sseCount,
      authenticatedCount,
    };
  }

  /**
   * Sweeps stale connections that have exceeded the inactivity threshold.
   */
  public sweepStale(timeoutMs: number, now = new Date()): number {
    let evicted = 0;
    for (const [id, session] of this.sessions.entries()) {
      const elapsed = now.getTime() - session.lastActivityAt.getTime();
      // Guard: Evict if client has not responded within timeout threshold
      if (elapsed > timeoutMs) {
        session.close(1008, "Session timed out due to inactivity");
        this.unregister(id);
        evicted++;
      }
    }
    return evicted;
  }

  /**
   * Returns an array of all active sessions.
   */
  public getAll(): readonly ClientSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Returns current active connection count.
   */
  public get count(): number {
    return this.sessions.size;
  }
}
