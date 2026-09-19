/**
 * @file apps/realtime/src/contracts/channel-topics.ts
 * @description Standardized pub/sub topic names and channel routing helpers.
 */

/**
 * Standard topic prefix namespaces for realtime room multiplexing.
 */
export const ChannelNamespace = {
  EXECUTION: "execution",
  AGENT: "agent",
  TENANT: "tenant",
  SYSTEM: "system",
} as const;

export type ChannelNamespace = (typeof ChannelNamespace)[keyof typeof ChannelNamespace];

/**
 * Utility functions for formatting and parsing standard realtime channel topics.
 */
export const ChannelTopics = {
  /**
   * Generates execution-specific channel name for live token streaming and step updates.
   */
  execution(executionId: string): string {
    return `${ChannelNamespace.EXECUTION}:${executionId}`;
  },

  /**
   * Generates agent-specific channel name for agent lifecycle and status notifications.
   */
  agent(agentId: string): string {
    return `${ChannelNamespace.AGENT}:${agentId}`;
  },

  /**
   * Generates tenant-wide channel name for cross-workspace notifications.
   */
  tenant(tenantId: string): string {
    return `${ChannelNamespace.TENANT}:${tenantId}`;
  },

  /**
   * Generates system-wide broadcast channel for maintenance and global notices.
   */
  systemBroadcast(): string {
    return `${ChannelNamespace.SYSTEM}:broadcast`;
  },

  /**
   * Parses a channel topic string into its namespace and target resource identifier.
   */
  parse(topic: string): { namespace: string; resourceId?: string } {
    const parts = topic.split(":");
    return {
      namespace: parts[0] ?? "",
      resourceId: parts[1],
    };
  },

  /**
   * Validates if a channel topic adheres to platform routing conventions.
   */
  isValid(topic: string): boolean {
    if (!topic || typeof topic !== "string") {
      return false;
    }
    const [ns, id] = topic.split(":");
    if (!ns || !id) {
      return false;
    }
    return Object.values(ChannelNamespace).includes(ns as ChannelNamespace);
  },
};
