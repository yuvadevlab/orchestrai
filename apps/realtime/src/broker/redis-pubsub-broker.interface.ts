/**
 * @file apps/realtime/src/broker/redis-pubsub-broker.interface.ts
 * @description Contract for cross-instance message publishing and subscription bridging.
 */

export type PubSubMessageHandler = (channel: string, message: string) => void;

/**
 * Interface defining operations for distributed cross-instance pub/sub brokers.
 */
export interface IRedisPubSubBroker {
  /** Whether the broker has an active connection to the backing transport */
  readonly isConnected: boolean;

  /**
   * Initializes connections and begins listening for remote messages.
   */
  start(): Promise<void>;

  /**
   * Shuts down subscriptions and disconnects clients cleanly.
   */
  stop(): Promise<void>;

  /**
   * Publishes a message to a named channel across the distributed cluster.
   *
   * @param channel - Target channel name
   * @param message - Serialized string payload
   * @returns Number of clients/nodes that received the message
   */
  publish(channel: string, message: string): Promise<number>;

  /**
   * Subscribes to a channel name or glob pattern.
   *
   * @param pattern - Channel or pattern name (e.g., 'orchestrai:realtime:*')
   */
  subscribePattern(pattern: string): Promise<void>;

  /**
   * Registers a callback invoked whenever a message arrives on a subscribed channel.
   *
   * @param handler - Function invoked with channel and message string
   */
  onMessage(handler: PubSubMessageHandler): void;
}
