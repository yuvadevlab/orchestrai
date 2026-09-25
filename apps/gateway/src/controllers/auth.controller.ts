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
import { AuthService } from "@/services/auth.service";

/**
 * Extracts a readable error message from Zod validation or standard Error instances.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  // If validation failed via Zod schema
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    if (firstIssue) {
      return firstIssue.message;
    }
  }
  // If standard runtime exception
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
   */
  public async login(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      const dto = LoginRequestSchema.parse(req.body);
      const result = await this.service.login(dto);
      sendJson(res, 200, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Authentication failed");
      sendJson(res, 401, {
        error: { code: "UNAUTHORIZED", message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Handles new tenant & user registration.
   */
  public async signup(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      const dto = SignupRequestSchema.parse(req.body);
      const result = await this.service.signup(dto);
      sendJson(res, 201, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Registration failed");
      const isConflict = message.includes("already exists");
      const status = isConflict ? 409 : 400;
      const code = isConflict ? "CONFLICT" : "BAD_REQUEST";
      sendJson(res, status, {
        error: { code, message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Handles forgot password email submission.
   */
  public async forgotPassword(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      const dto = ForgotPasswordRequestSchema.parse(req.body);
      const result = await this.service.forgotPassword(dto);
      sendJson(res, 200, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Password recovery failed");
      sendJson(res, 400, {
        error: { code: "BAD_REQUEST", message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Handles password reset with security token.
   */
  public async resetPassword(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    try {
      const dto = ResetPasswordRequestSchema.parse(req.body);
      const result = await this.service.resetPassword(dto);
      sendJson(res, 200, result);
    } catch (err) {
      const message = extractErrorMessage(err, "Password reset failed");
      sendJson(res, 400, {
        error: { code: "BAD_REQUEST", message, requestId: req.context?.requestId },
      });
    }
  }

  /**
   * Retrieves active session details for authenticated user.
   */
  public async getCurrentSession(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendJson(res, 401, {
        error: { code: "UNAUTHORIZED", message: "No active session token provided" },
      });
      return;
    }

    const token = authHeader.slice(7).trim();
    const user = await this.service.getUserByToken(token);

    if (!user) {
      sendJson(res, 401, {
        error: { code: "UNAUTHORIZED", message: "Session token invalid or expired" },
      });
      return;
    }

    sendJson(res, 200, { user });
  }
}
