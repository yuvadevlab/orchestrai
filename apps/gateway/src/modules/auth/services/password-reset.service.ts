/**
 * @file apps/gateway/src/services/password-reset.service.ts
 * @description Temporary password reset token management and credentials updating in PostgreSQL.
 * @module apps/gateway/services
 */

import { randomUUID } from "node:crypto";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { prisma } from "@orchestrai/database";
import { loadGatewayConfig } from "@/config";
import { LocalStore } from "@/db/local-store";
import { hashPassword } from "./crypto";
import type { ForgotPasswordRequest, ResetPasswordRequest } from "@/validation/auth.schema";

const logger = loggerWithConfig(new Logger("PasswordResetService"));

/**
 * Service managing password recovery requests and reset workflows.
 */
export class PasswordResetService {
  private static instance: PasswordResetService;
  private resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();

  public static getInstance(): PasswordResetService {
    if (!PasswordResetService.instance) {
      PasswordResetService.instance = new PasswordResetService();
    }
    return PasswordResetService.instance;
  }

  /**
   * Generates a temporary reset token if the user exists in PostgreSQL or LocalStore.
   *
   * @param req - ForgotPasswordRequest containing email
   * @returns Success response object
   */
  public async forgotPassword(
    req: ForgotPasswordRequest,
  ): Promise<{ success: boolean; message: string }> {
    const emailKey = req.email.toLowerCase().trim();
    const config = loadGatewayConfig();

    let userExists = false;

    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: emailKey },
      });
      if (dbUser) userExists = true;
    } catch {
      // Fallback check
    }

    if (!userExists) {
      const localUser = LocalStore.getInstance().findUserByEmail(emailKey);
      if (localUser) userExists = true;
    }

    if (userExists) {
      const resetToken = randomUUID();
      const expiresAt = Date.now() + config.resetTokenExpirationMinutes * 60 * 1000;
      this.resetTokens.set(resetToken, { email: emailKey, expiresAt });
      logger.info("[PasswordReset] Reset token generated", { email: emailKey, resetToken });
    }

    return {
      success: true,
      message: "If an account exists with this email, password reset instructions have been sent.",
    };
  }

  /**
   * Resets the password in PostgreSQL and LocalStore using a valid reset token.
   *
   * @param req - ResetPasswordRequest containing token and new password
   * @returns Success message
   */
  public async resetPassword(
    req: ResetPasswordRequest,
  ): Promise<{ success: boolean; message: string }> {
    const record = this.resetTokens.get(req.token);
    if (!record || record.expiresAt < Date.now()) {
      throw new Error("Invalid or expired password reset token");
    }

    const newHash = hashPassword(req.newPassword);
    let updatedInDb = false;

    try {
      await prisma.user.updateMany({
        where: { email: record.email },
        data: { passwordHash: newHash },
      });
      updatedInDb = true;
      logger.info("[PasswordReset] Password updated in PostgreSQL", { email: record.email });
    } catch {
      // Fallback
    }

    const localUser = LocalStore.getInstance().findUserByEmail(record.email);
    if (localUser) {
      LocalStore.getInstance().updateUserPassword(localUser.id, newHash);
      logger.info("[PasswordReset] Password updated in LocalStore", { email: record.email });
    } else if (!updatedInDb) {
      throw new Error("User account not found");
    }

    this.resetTokens.delete(req.token);

    return {
      success: true,
      message: "Password has been successfully updated. You may now log in.",
    };
  }
}
