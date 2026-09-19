/**
 * @file apps/realtime/src/presence/presence-manager.ts
 * @description Tracks connected operators per execution room and broadcasts JOIN/LEAVE presence state.
 */

import { ServerMessageType } from "../contracts/ws-protocol.types";
import type { ConnectionRegistry } from "../connection/connection-registry";
import type { SubscriptionManager } from "../subscriptions/subscription-manager";
import { ChannelTopics } from "../contracts/channel-topics";

export type PresenceEvent = "JOIN" | "LEAVE";

export interface PresenceState {
  readonly executionId: string;
  readonly viewers: readonly string[];
  readonly viewerCount: number;
}

/**
 * Maintains realtime viewer presence per execution room and pushes state-change broadcasts.
 */
export class PresenceManager {
  /** Maps executionId → Set of connected session IDs watching that execution */
  private readonly rooms = new Map<string, Set<string>>();

  /**
   * Registers a session as an active viewer in an execution room and broadcasts JOIN.
   */
  public join(
    executionId: string,
    sessionId: string,
    registry: ConnectionRegistry,
    subscriptions: SubscriptionManager,
  ): void {
    let room = this.rooms.get(executionId);
    if (!room) {
      room = new Set();
      this.rooms.set(executionId, room);
    }

    // Only broadcast if this is genuinely a new joiner to avoid duplicate presence events
    if (!room.has(sessionId)) {
      room.add(sessionId);
      const state = this.getState(executionId);
      const payload = JSON.stringify({
        type: ServerMessageType.PRESENCE,
        timestamp: Date.now(),
        payload: { event: "JOIN" as PresenceEvent, ...state },
      });
      subscriptions.broadcastToTopic(ChannelTopics.execution(executionId), payload, registry);
    }
  }

  /**
   * Removes a session from an execution room and broadcasts LEAVE with updated state.
   */
  public leave(
    executionId: string,
    sessionId: string,
    registry: ConnectionRegistry,
    subscriptions: SubscriptionManager,
  ): void {
    const room = this.rooms.get(executionId);
    if (!room) {
      return;
    }

    room.delete(sessionId);

    // Clean up empty rooms to prevent memory accumulation on long-running servers
    if (room.size === 0) {
      this.rooms.delete(executionId);
    }

    const state = this.getState(executionId);
    const payload = JSON.stringify({
      type: ServerMessageType.PRESENCE,
      timestamp: Date.now(),
      payload: { event: "LEAVE" as PresenceEvent, ...state },
    });
    subscriptions.broadcastToTopic(ChannelTopics.execution(executionId), payload, registry);
  }

  /**
   * Returns the current presence state (viewer list) for a given execution room.
   */
  public getState(executionId: string): PresenceState {
    const room = this.rooms.get(executionId) ?? new Set();
    return {
      executionId,
      viewers: Array.from(room),
      viewerCount: room.size,
    };
  }

  /**
   * Returns all execution IDs with at least one active viewer.
   */
  public getActiveRooms(): readonly string[] {
    return Array.from(this.rooms.keys());
  }
}
