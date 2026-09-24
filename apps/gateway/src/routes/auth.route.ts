/**
 * @file apps/gateway/src/routes/auth.route.ts
 * @description REST API routes for authentication (login, signup, forgot-password, reset-password, session).
 */

import type { RouteGroup } from "./router";
import { AuthController } from "@/controllers";

/**
 * Registers authentication routes onto the gateway router scoped under /auth.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Auth controller instance
 */
export function registerAuthRoutes(
  api: RouteGroup,
  controller: AuthController = new AuthController(),
): void {
  api.group("/auth", (group) => {
    group.post("/login", (req, res) => controller.login(req, res));
    group.post("/signup", (req, res) => controller.signup(req, res));
    group.post("/forgot-password", (req, res) => controller.forgotPassword(req, res));
    group.post("/reset-password", (req, res) => controller.resetPassword(req, res));
    group.get("/session", (req, res) => controller.getCurrentSession(req, res));
  });
}
