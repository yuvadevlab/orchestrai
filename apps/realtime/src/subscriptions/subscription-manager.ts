/**
 * @file apps/realtime/src/subscriptions/subscription-manager.ts
 * @description Manages channel topics, multiplexed room subscriptions, and fan-out dispatch.
 */

import type { ConnectionRegistry } from "@/connection";

/**
 * Coordinates channel subscription mappings and dispatches messages to listening clients.
 */
export class SubscriptionManager {
  private readonly topicToSessions = new Map<string, Set<string>>();
  private readonly sessionToTopics = new Map<string, Set<string>>();

  /**
   * Subscribes a client session to a channel topic.
   */
  public subscribe(sessionId: string, topic: string): void {
    // 1. Add session to topic subscriber set
    let sessions = this.topicToSessions.get(topic);
    if (!sessions) {
      sessions = new Set();
      this.topicToSessions.set(topic, sessions);
    }
    sessions.add(sessionId);

    // 2. Add topic to session topic set
    let topics = this.sessionToTopics.get(sessionId);
    if (!topics) {
      topics = new Set();
      this.sessionToTopics.set(sessionId, topics);
    }
    topics.add(topic);
  }

  /**
   * Unsubscribes a client session from a specific topic.
   */
  public unsubscribe(sessionId: string, topic: string): void {
    const sessions = this.topicToSessions.get(topic);
    if (sessions) {
      sessions.delete(sessionId);
      if (sessions.size === 0) {
        this.topicToSessions.delete(topic);
      }
    }

    const topics = this.sessionToTopics.get(sessionId);
    if (topics) {
      topics.delete(topic);
      if (topics.size === 0) {
        this.sessionToTopics.delete(sessionId);
      }
    }
  }

  /**
   * Removes all subscriptions associated with a disconnecting session.
   */
  public unsubscribeAll(sessionId: string): void {
    const topics = this.sessionToTopics.get(sessionId);
    if (!topics) {
      return;
    }

    for (const topic of topics) {
      const sessions = this.topicToSessions.get(topic);
      if (sessions) {
        sessions.delete(sessionId);
        if (sessions.size === 0) {
          this.topicToSessions.delete(topic);
        }
      }
    }

    this.sessionToTopics.delete(sessionId);
  }

  /**
   * Returns all session IDs currently subscribed to a topic.
   */
  public getSubscribers(topic: string): readonly string[] {
    const sessions = this.topicToSessions.get(topic);
    return sessions ? Array.from(sessions) : [];
  }

  /**
   * Returns all topics that a given session is subscribed to.
   */
  public getSubscriptions(sessionId: string): readonly string[] {
    const topics = this.sessionToTopics.get(sessionId);
    return topics ? Array.from(topics) : [];
  }

  /**
   * Broadcasts a serialized payload to all client sessions subscribed to the topic.
   *
   * @param topic - Channel topic to fan out across
   * @param payload - Pre-serialized string message
   * @param registry - Active ConnectionRegistry used to resolve session IDs to sockets
   * @returns Count of clients that successfully received the broadcast
   */
  public broadcastToTopic(topic: string, payload: string, registry: ConnectionRegistry): number {
    const sessionIds = this.topicToSessions.get(topic);
    if (!sessionIds || sessionIds.size === 0) {
      return 0;
    }

    let delivered = 0;
    for (const id of sessionIds) {
      const session = registry.get(id);
      // Guard: Ensure session is still connected before transmitting
      if (session) {
        try {
          session.send(payload);
          delivered++;
        } catch {
          // If sending fails, session may have severed abruptly
          this.unsubscribe(id, topic);
        }
      } else {
        // Stale session entry cleanup
        this.unsubscribe(id, topic);
      }
    }

    return delivered;
  }

  /**
   * Returns the count of unique active topics currently tracked.
   */
  public get topicCount(): number {
    return this.topicToSessions.size;
  }
}
