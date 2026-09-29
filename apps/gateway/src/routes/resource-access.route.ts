/**
 * @file apps/gateway/src/routes/resource-access.route.ts
 * @description REST API routes for system-wide Resources, Capabilities, Access Grants, and Approval Decisions.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { ResourceAccessController } from "@/controllers/resource-access.controller";

/**
 * Registers resource and access control routes on the gateway API.
 *
 * @param api - Base API route group
 * @param controller - ResourceAccessController instance
 */
export function registerResourceAccessRoutes(
  api: RouteGroup,
  controller: ResourceAccessController = new ResourceAccessController(),
): void {
  // Resources catalog
  api.group("/resources", (group) => {
    group.get("/", (req, res) => controller.listResources(req, res));
  });

  // Capabilities catalog
  api.group("/capabilities", (group) => {
    group.get("/", (req, res) => controller.listCapabilities(req, res));
  });

  // Active access grants
  api.group("/grants", (group) => {
    group.get("/", (req, res) => controller.listGrants(req, res));
    group.delete("/:id", (req, res) => controller.revokeGrant(req, res));
  });

  // Clearance approval requests
  api.group("/approval-requests", (group) => {
    group.get("/", (req, res) => controller.listRequests(req, res));
    group.post("/:id/decide", (req, res) => controller.decideRequest(req, res));
  });
}
