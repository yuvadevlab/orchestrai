/**
 * @file apps/gateway/src/modules/auth/index.ts
 * @description Auth module barrel — exports route registration and all auth services.
 * @module apps/gateway/modules/auth
 */
export { registerAuthRoutes } from "./controllers/auth.route";
export { AuthController } from "./controllers/auth.controller";
export { AuthService } from "./services/auth.service";
export { issueSessionToken, resolveUserByToken } from "./services/token.service";
