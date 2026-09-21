/**
 * @file apps/gateway/src/routes/agent.route.ts
 * @description REST API routes for registering, querying, and updating agent definitions.
 */

import type { Router } from "./router";
import { AgentController } from "@/controllers";

/**
 * Registers agent definition routes onto the gateway router.
 *
 * @param router - Gateway router instance
 * @param controller - Agent controller instance
 */
export function registerAgentRoutes(
  router: Router,
  controller: AgentController = new AgentController(),
): void {
  router.get("/api/v1/agents", (req, res) => controller.listAgents(req, res));
  router.post("/api/v1/agents", (req, res) => controller.createAgent(req, res));
  router.get("/api/v1/agents/:id", (req, res) => controller.getAgent(req, res));
  router.put("/api/v1/agents/:id", (req, res) => controller.updateAgent(req, res));
}
