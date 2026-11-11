/**
 * @file apps/gateway/src/controllers/auth.controller.ts
 * @description HTTP controller mediating authentication flows with DevLab Central SSO.
 * @author yuva.devlab@gmail.com
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { AuthService } from "../services/auth.service";

/**
 * Controller managing user authentication and tenant registration HTTP endpoints.
 */
export class AuthController {
  constructor(private readonly service: AuthService = AuthService.getInstance()) {}

  /**
   * Returns DevLab Portal Central SSO URL for authentication.
   */
  public getSsoUrl(_req: GatewayRequest, res: GatewayResponse): void {
    const portalWebUrl =
      process.env.DEVLAB_PORTAL_WEB_URL ||
      process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL ||
      "http://localhost:3000";
    sendJson(res, 200, {
      ssoUrl: `${portalWebUrl}/login?app=orchestrai`,
      portalUrl: portalWebUrl,
    });
  }

  /**
   * Retrieves active session details for authenticated user via DevLab token.
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

  /**
   * Deprecated custom login endpoint. Directs consumers to DevLab SSO.
   */
  public async login(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const portalWebUrl =
      process.env.DEVLAB_PORTAL_WEB_URL ||
      process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL ||
      "http://localhost:3000";
    sendJson(res, 400, {
      error: {
        code: "DEPRECATED_AUTH_METHOD",
        message: "Custom login is disabled. Please authenticate via DevLab Portal SSO.",
        ssoUrl: `${portalWebUrl}/login?app=orchestrai`,
        requestId: req.context?.requestId,
      },
    });
  }

  /**
   * Deprecated custom signup endpoint. Directs consumers to DevLab SSO.
   */
  public async signup(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const portalWebUrl =
      process.env.DEVLAB_PORTAL_WEB_URL ||
      process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL ||
      "http://localhost:3000";
    sendJson(res, 400, {
      error: {
        code: "DEPRECATED_AUTH_METHOD",
        message: "Custom registration is disabled. Please register via DevLab Portal.",
        registerUrl: `${portalWebUrl}/register?app=orchestrai`,
        requestId: req.context?.requestId,
      },
    });
  }

  /**
   * Deprecated custom forgot password endpoint.
   */
  public async forgotPassword(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const portalWebUrl =
      process.env.DEVLAB_PORTAL_WEB_URL ||
      process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL ||
      "http://localhost:3000";
    sendJson(res, 400, {
      error: {
        code: "DEPRECATED_AUTH_METHOD",
        message: "Password recovery is managed centrally via DevLab Portal.",
        ssoUrl: `${portalWebUrl}/forgot-password?app=orchestrai`,
        requestId: req.context?.requestId,
      },
    });
  }

  /**
   * Deprecated custom reset password endpoint.
   */
  public async resetPassword(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const portalWebUrl =
      process.env.DEVLAB_PORTAL_WEB_URL ||
      process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL ||
      "http://localhost:3000";
    sendJson(res, 400, {
      error: {
        code: "DEPRECATED_AUTH_METHOD",
        message: "Password reset is managed centrally via DevLab Portal.",
        ssoUrl: `${portalWebUrl}/reset-password?app=orchestrai`,
        requestId: req.context?.requestId,
      },
    });
  }
}
