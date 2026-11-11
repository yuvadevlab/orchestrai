/**
 * @file apps/gateway/src/routes/auth.route.ts
 * @description REST API routes for authentication and DevLab SSO integration.
 * @author yuva.devlab@gmail.com
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "@/routes/router";
import { AuthController } from "./auth.controller";

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
    group.get("/sso-url", (req, res) => controller.getSsoUrl(req, res));
    group.get("/session", (req, res) => controller.getCurrentSession(req, res));
    group.get("/me", (req, res) => controller.getCurrentSession(req, res));
    group.post("/login", (req, res) => controller.login(req, res));
    group.post("/signup", (req, res) => controller.signup(req, res));
    group.post("/forgot-password", (req, res) => controller.forgotPassword(req, res));
    group.post("/reset-password", (req, res) => controller.resetPassword(req, res));
  });
}
