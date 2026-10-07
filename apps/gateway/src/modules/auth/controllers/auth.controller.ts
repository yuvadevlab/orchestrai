/**
 * @file apps/gateway/src/controllers/auth.controller.ts
 * @description HTTP controller mediating authentication flows (login, signup, password resets).
 * @module apps/gateway/controllers
 */

import { ZodError } from "zod";
import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import {
  LoginRequestSchema,
  SignupRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
} from "@/validation/auth.schema";
import { AuthService } from "../services/auth.service";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("AuthController"));

/**
 * Extracts a readable error message from Zod validation or standard Error instances.
 *
 * @param err - Unknown thrown error entity.
 * @param fallback - Default message string to return if extraction yields no message.
 * @returns Human-readable error description string.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  // If validation failed via Zod schema definition
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    if (firstIssue) {
      return firstIssue.message;
    }
  }
  // If standard runtime exception with message string
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

/**
 * Controller managing user authentication and tenant registration HTTP endpoints.
 */
export class AuthController {
  constructor(private readonly service: AuthService = AuthService.getInstance()) {}

  /**
   * Handles user login and session token issuance.
   *
   * @param req - Inbound gateway HTTP request containing LoginRequest payload.
   * @param res - Outbound gateway HTTP response sending JWT token and user profile.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async login(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      // Validate incoming email and password structure
      const dto = LoginRequestSchema.parse(req.body);
      logger.info("login: authenticating user credentials", { email: dto.email });

      // Delegate credential check and token creation to AuthService
      const result = await this.service.login(dto);
      sendJson(res, 200, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Authentication failed");
      logger.warn("login: authentication failed", { error: message });
      sendJson(res, 401, {
        error: { code: "UNAUTHORIZED", message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Handles new tenant and operator user registration.
   *
   * @param req - Inbound gateway HTTP request containing SignupRequest payload.
   * @param res - Outbound gateway HTTP response sending created credentials (201 Created).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async signup(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      // Validate registration parameters
      const dto = SignupRequestSchema.parse(req.body);
      logger.info("signup: registering new tenant user", {
        email: dto.email,
        tenantName: dto.tenantName,
      });

      // Execute tenant creation and user credential storage
      const result = await this.service.signup(dto);
      sendJson(res, 201, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Registration failed");
      const isConflict = message.includes("already exists");
      const status = isConflict ? 409 : 400;
      const code = isConflict ? "CONFLICT" : "BAD_REQUEST";

      logger.warn("signup: registration rejected", { error: message, isConflict });
      sendJson(res, status, {
        error: { code, message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Handles forgot password email submission and sends reset notification.
   *
   * @param req - Inbound gateway HTTP request containing user email address.
   * @param res - Outbound gateway HTTP response acknowledging request.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async forgotPassword(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      // Validate email format
      const dto = ForgotPasswordRequestSchema.parse(req.body);
      logger.info("forgotPassword: initiating recovery flow", { email: dto.email });

      // Trigger password reset token generation
      const result = await this.service.forgotPassword(dto);
      sendJson(res, 200, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Password recovery failed");
      logger.warn("forgotPassword: recovery flow failed", { error: message });
      sendJson(res, 400, {
        error: { code: "BAD_REQUEST", message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Handles password reset with verified security token.
   *
   * @param req - Inbound gateway HTTP request containing token and new password.
   * @param res - Outbound gateway HTTP response confirming password update.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async resetPassword(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      // Validate token and password requirements
      const dto = ResetPasswordRequestSchema.parse(req.body);
      logger.info("resetPassword: resetting account password");

      // Apply new password hash
      const result = await this.service.resetPassword(dto);
      sendJson(res, 200, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Password reset failed");
      logger.warn("resetPassword: password reset failed", { error: message });
      sendJson(res, 400, {
        error: { code: "BAD_REQUEST", message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Retrieves active session details for authenticated user from Bearer header.
   *
   * @param req - Inbound gateway HTTP request with Authorization Bearer header.
   * @param res - Outbound gateway HTTP response sending authenticated user profile.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async getCurrentSession(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const authHeader = req.headers.authorization;
    // Guard: Validate presence and scheme of Bearer token header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("getCurrentSession: missing or malformed authorization header");
      sendJson(res, 401, {
        error: { code: "UNAUTHORIZED", message: "No active session token provided" },
      });
      return;
    }

    const token = authHeader.slice(7).trim();
    // Resolve user profile by token
    const user = await this.service.getUserByToken(token);

    // Guard: Token must resolve to a valid active user
    if (!user) {
      logger.warn("getCurrentSession: invalid or expired session token");
      sendJson(res, 401, {
        error: { code: "UNAUTHORIZED", message: "Session token invalid or expired" },
      });
      return;
    }

    logger.info("getCurrentSession: session validated successfully", {
      userId: user.id,
      tenantId: user.tenantId,
    });
    sendJson(res, 200, { user });
  }
}
