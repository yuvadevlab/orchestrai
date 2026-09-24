/**
 * @file apps/gateway/src/services/auth.service.ts
 * @description Centralized authentication orchestrator delegating login, registration, resets, and token verification.
 * @module apps/gateway/services
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { PasswordResetService } from "./password-reset.service";
import { resolveUserByToken, type ResolvedUser } from "./token.service";
import { authenticateLogin, type AuthResponsePayload } from "./auth-login";
import { registerSignup } from "./auth-signup";
import type {
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/validation/auth.schema";

export type { AuthResponsePayload };

const logger = loggerWithConfig(new Logger("AuthService"));

/**
 * Singleton authentication facade managing user sessions, registrations, and password recoveries.
 */
export class AuthService {
  private static instance: AuthService;
  private readonly passwordResetService = PasswordResetService.getInstance();

  private constructor() {
    logger.info("[AuthService] Initialized Authentication Service");
  }

  /**
   * Returns singleton AuthService instance.
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticates user against PostgreSQL with fallback.
   */
  public async login(req: LoginRequest): Promise<AuthResponsePayload> {
    return authenticateLogin(req);
  }

  /**
   * Registers a new tenant and user in PostgreSQL with fallback.
   */
  public async signup(req: SignupRequest): Promise<AuthResponsePayload> {
    return registerSignup(req);
  }

  /**
   * Dispatches forgot password flow.
   */
  public async forgotPassword(
    req: ForgotPasswordRequest,
  ): Promise<{ success: boolean; message: string }> {
    return this.passwordResetService.forgotPassword(req);
  }

  /**
   * Resets password using valid token.
   */
  public async resetPassword(
    req: ResetPasswordRequest,
  ): Promise<{ success: boolean; message: string }> {
    return this.passwordResetService.resetPassword(req);
  }

  /**
   * Resolves user metadata by bearer token.
   */
  public async getUserByToken(token: string): Promise<ResolvedUser | null> {
    return resolveUserByToken(token);
  }
}
