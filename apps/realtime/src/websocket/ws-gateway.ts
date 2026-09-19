/**
 * @file apps/realtime/src/websocket/ws-gateway.ts
 * @description Configures the WebSocketServer, handles upgrades, and manages heartbeat sweeps.
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer, IncomingMessage } from "node:http";
import { defaultLogger } from "@orchestrai/logger";
import { ClientSession } from "../connection/client-session";
import { ServerMessageType } from "../contracts/ws-protocol.types";
import { validateWsUpgradeToken } from "./ws-authenticator";
import { handleWsMessage } from "./ws-message-handler";
import type { ConnectionRegistry } from "../connection/connection-registry";
import type { SubscriptionManager } from "../subscriptions/subscription-manager";

interface WsGatewayDeps {
  readonly registry: ConnectionRegistry;
  readonly subscriptions: SubscriptionManager;
  readonly jwtSecret: string;
  readonly heartbeatIntervalMs: number;
  readonly maxPayloadBytes: number;
}

const PING_DATA = Buffer.from("ping");

/**
 * Manages the WebSocket server lifecycle, connection upgrades, and dead-connection sweeps.
 */
export class WsGateway {
  private wss?: WebSocketServer;
  private heartbeatTimer?: NodeJS.Timeout;
  private readonly deps: WsGatewayDeps;

  public constructor(deps: WsGatewayDeps) {
    this.deps = deps;
  }

  /**
   * Attaches the WebSocket server to the provided HTTP server on the `/ws` path.
   */
  public attach(httpServer: HttpServer): void {
    this.wss = new WebSocketServer({
      server: httpServer,
      path: "/ws",
      maxPayload: this.deps.maxPayloadBytes,
    });

    this.wss.on("connection", (socket: WebSocket, req: IncomingMessage) => {
      this.handleConnection(socket, req);
    });

    this.wss.on("error", (err) => {
      defaultLogger.error("WebSocket server error", { error: String(err) });
    });

    // Start heartbeat sweep interval to detect dead connections
    this.heartbeatTimer = setInterval(() => {
      this.sweepDeadConnections();
    }, this.deps.heartbeatIntervalMs);

    defaultLogger.info("WebSocket gateway attached on path /ws");
  }

  /**
   * Registers a new connection, validates upgrade token, and sets up event handlers.
   */
  private handleConnection(socket: WebSocket, req: IncomingMessage): void {
    const sessionId = crypto.randomUUID();
    const authResult = validateWsUpgradeToken(req, this.deps.jwtSecret);

    const session = new ClientSession({
      id: sessionId,
      transport: "WEBSOCKET",
      ipAddress: req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      sendFn: (data) => {
        // Guard: Only transmit if socket is still open
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data);
        }
      },
      closeFn: (code = 1000, reason = "Normal Closure") => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close(code, reason);
        }
      },
    });

    if (authResult.authenticated && authResult.userId) {
      this.deps.registry.bindUser(sessionId, authResult.userId);
    }

    try {
      this.deps.registry.register(session);
    } catch {
      socket.close(1013, "Server connection limit reached");
      return;
    }

    // Send initial CONNECTED handshake
    socket.send(
      JSON.stringify({
        type: ServerMessageType.CONNECTED,
        timestamp: Date.now(),
        payload: { sessionId },
      }),
    );

    socket.on("message", (data) => {
      handleWsMessage(session, data as Buffer, {
        registry: this.deps.registry,
        subscriptions: this.deps.subscriptions,
        jwtSecret: this.deps.jwtSecret,
      });
    });

    socket.on("close", () => {
      this.deps.subscriptions.unsubscribeAll(sessionId);
      this.deps.registry.unregister(sessionId);
      defaultLogger.debug("WebSocket client disconnected", { sessionId });
    });

    socket.on("error", (err) => {
      defaultLogger.warn("WebSocket client error", { sessionId, error: String(err) });
    });

    // Mark socket as alive for heartbeat tracking
    (socket as WebSocket & { isAlive?: boolean }).isAlive = true;
    socket.on("pong", () => {
      (socket as WebSocket & { isAlive?: boolean }).isAlive = true;
    });

    defaultLogger.debug("WebSocket client connected", { sessionId });
  }

  /**
   * Pings all connected sockets and terminates connections that failed to pong back.
   */
  private sweepDeadConnections(): void {
    this.wss?.clients.forEach((socket) => {
      const ws = socket as WebSocket & { isAlive?: boolean };
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping(PING_DATA);
    });
  }

  /**
   * Shuts down the WebSocket server and clears the heartbeat interval.
   */
  public async close(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    await new Promise<void>((resolve) => {
      if (!this.wss) {
        resolve();
        return;
      }
      this.wss.close(() => resolve());
    });
  }
}
