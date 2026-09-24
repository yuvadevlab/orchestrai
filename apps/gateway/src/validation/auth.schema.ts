/**
 * @file apps/gateway/src/validation/auth.schema.ts
 * @description Zod validation schemas for authentication endpoints (Login, Signup, Forgot Password).
 */

import { z } from "zod";

/**
 * Validation schema for user authentication / login request.
 */
export const LoginRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
  tenantId: z.string().min(1, "Tenant ID cannot be empty").optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Validation schema for registration request with email and password.
 */
export const SignupRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
  name: z.string().min(1).optional(),
  tenantName: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

/**
 * Validation schema for password recovery request.
 */
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

/**
 * Validation schema for password reset confirmation.
 */
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must contain at least 6 characters"),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
