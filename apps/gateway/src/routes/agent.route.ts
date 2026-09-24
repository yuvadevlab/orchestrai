/**
 * @file apps/gateway/src/routes/agent.route.ts
 * @description REST API routes for registering, querying, and updating agent definitions.
 */

import type { RouteGroup } from "./router";
import { AgentController } from "@/controllers";

/**
 * Registers agent definition routes onto the gateway router scoped under /agents.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Agent controller instance
 */
export function registerAgentRoutes(
  api: RouteGroup,
  controller: AgentController = new AgentController(),
): void {
  api.group("/agents", (group) => {
    group.get("/", (req, res) => controller.listAgents(req, res));
    group.post("/", (req, res) => controller.createAgent(req, res));
    group.get("/:id", (req, res) => controller.getAgent(req, res));
    group.put("/:id", (req, res) => controller.updateAgent(req, res));
    group.delete("/:id", (req, res) => controller.deleteAgent(req, res));
  });
}
