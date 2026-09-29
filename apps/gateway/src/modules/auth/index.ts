/**
 * @file apps/gateway/src/modules/auth/index.ts
 * @description Auth module barrel — exports route registration and all auth services.
 * @module apps/gateway/modules/auth
 */
export { registerAuthRoutes } from "./auth.route";
export { AuthController } from "./auth.controller";
export { AuthService } from "./auth.service";
export { issueSessionToken, resolveUserByToken } from "./token.service";
