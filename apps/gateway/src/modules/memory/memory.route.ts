/**
 * @file apps/gateway/src/routes/memory.route.ts
 * @description REST API routes for listing, searching, and managing agent memory items.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "@/routes/router";
import { MemoryController } from "./memory.controller";

/**
 * Registers memory routes onto the gateway router scoped under /memory.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Memory controller instance
 */
export function registerMemoryRoutes(
  api: RouteGroup,
  controller: MemoryController = new MemoryController(),
): void {
  api.group("/memory", (group) => {
    group.get("/", (req, res) => controller.list(req, res));
    group.post("/", (req, res) => controller.create(req, res));
    group.post("/search", (req, res) => controller.search(req, res));
    group.delete("/:id", (req, res) => controller.delete(req, res));
  });
}
