/**
 * @file apps/realtime/src/connection/client-session.ts
 * @description Encapsulates an active client connection session across WebSocket or SSE transports.
 */

export type ClientTransportType = "WEBSOCKET" | "SSE";

export interface ClientSessionOptions {
  readonly id: string;
  readonly transport: ClientTransportType;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly sendFn: (data: string) => void;
  readonly closeFn: (code?: number, reason?: string) => void;
}

/**
 * Tracks the state, security principal, and subscriptions for a single connected client.
 */
export class ClientSession {
  public readonly id: string;
  public readonly transport: ClientTransportType;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly connectedAt: Date;

  public userId?: string;
  public tenantId?: string;
  public isAuthenticated = false;
  public lastActivityAt: Date;

  private readonly subscriptions = new Set<string>();
  private readonly sendFn: (data: string) => void;
  private readonly closeFn: (code?: number, reason?: string) => void;

  public constructor(options: ClientSessionOptions) {
    this.id = options.id;
    this.transport = options.transport;
    this.ipAddress = options.ipAddress;
    this.userAgent = options.userAgent;
    this.sendFn = options.sendFn;
    this.closeFn = options.closeFn;
    this.connectedAt = new Date();
    this.lastActivityAt = new Date();
  }

  /**
   * Updates the last activity timestamp to prevent stale session timeout.
   */
  public touch(): void {
    this.lastActivityAt = new Date();
  }

  /**
   * Dispatches formatted string payload to the underlying transport socket/stream.
   */
  public send(payload: string): void {
    this.touch();
    this.sendFn(payload);
  }

  /**
   * Closes the underlying connection socket or response stream.
   */
  public close(code = 1000, reason = "Normal Closure"): void {
    this.closeFn(code, reason);
  }

  /**
   * Subscribes the client session to a channel topic.
   */
  public subscribe(topic: string): void {
    this.subscriptions.add(topic);
  }

  /**
   * Unsubscribes the client session from a channel topic.
   */
  public unsubscribe(topic: string): void {
    this.subscriptions.delete(topic);
  }

  /**
   * Returns an immutable array of active topic subscriptions.
   */
  public getSubscriptions(): readonly string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Checks if this session is subscribed to the specified topic.
   */
  public isSubscribedTo(topic: string): boolean {
    return this.subscriptions.has(topic);
  }
}
