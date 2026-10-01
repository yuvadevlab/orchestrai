/**
 * @file apps/admin/src/routes/platform.routes.ts
 * @description Operator Control Plane route registrations for providers, models, modes, and budgets.
 * @module apps/admin/routes
 */

import type { AdminRouter, AdminResponse } from "./router";
import {
  LlmProviderAdminService,
  LlmModelAdminService,
  PlatformModeAdminService,
  PlatformRoleAdminService,
  PlatformPermissionAdminService,
  PlatformToolAdminService,
  TenantBudgetAdminService,
} from "@/services";

const providerService = new LlmProviderAdminService();
const modelService = new LlmModelAdminService();
const modeService = new PlatformModeAdminService();
const roleService = new PlatformRoleAdminService();
const permissionService = new PlatformPermissionAdminService();
const toolService = new PlatformToolAdminService();
const budgetService = new TenantBudgetAdminService();

/**
 * Sends a standard JSON response with 200 OK.
 */
function sendJson(res: AdminResponse, data: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

/**
 * Registers all platform catalog and budget administration routes.
 */
export function registerPlatformRoutes(router: AdminRouter): void {
  // --- LLM Providers ---
  router.get("/platform/llm-provider", async (_req, res) => {
    const list = await providerService.listProviders();
    sendJson(res, list);
  });
  router.post("/platform/llm-provider", async (req, res) => {
    const record = await providerService.createProvider(req.body as never);
    sendJson(res, record, 201);
  });
  router.put("/platform/llm-provider/:id", async (req, res) => {
    const record = await providerService.updateProvider(req.params.id || "", req.body as never);
    sendJson(res, record);
  });
  router.delete("/platform/llm-provider/:id", async (req, res) => {
    await providerService.deleteProvider(req.params.id || "");
    sendJson(res, { success: true });
  });

  // --- LLM Models ---
  router.get("/platform/llm-model", async (req, res) => {
    const list = await modelService.listModels(req.query.providerId);
    sendJson(res, list);
  });
  router.post("/platform/llm-model", async (req, res) => {
    const record = await modelService.createModel(req.body as never);
    sendJson(res, record, 201);
  });
  router.put("/platform/llm-model/:id", async (req, res) => {
    const record = await modelService.updateModel(req.params.id || "", req.body as never);
    sendJson(res, record);
  });
  router.delete("/platform/llm-model/:id", async (req, res) => {
    await modelService.deleteModel(req.params.id || "");
    sendJson(res, { success: true });
  });

  // --- Platform Modes ---
  router.get("/platform/platform-mode", async (_req, res) => {
    const list = await modeService.listModes();
    sendJson(res, list);
  });
  router.post("/platform/platform-mode", async (req, res) => {
    const record = await modeService.createMode(req.body as never);
    sendJson(res, record, 201);
  });
  router.put("/platform/platform-mode/:id", async (req, res) => {
    const record = await modeService.updateMode(req.params.id || "", req.body as never);
    sendJson(res, record);
  });
  router.delete("/platform/platform-mode/:id", async (req, res) => {
    await modeService.deleteMode(req.params.id || "");
    sendJson(res, { success: true });
  });

  // --- Platform Roles ---
  router.get("/platform/platform-role", async (_req, res) => {
    const list = await roleService.listRoles();
    sendJson(res, list);
  });
  router.post("/platform/platform-role", async (req, res) => {
    const record = await roleService.createRole(req.body as never);
    sendJson(res, record, 201);
  });
  router.put("/platform/platform-role/:id", async (req, res) => {
    const record = await roleService.updateRole(req.params.id || "", req.body as never);
    sendJson(res, record);
  });
  router.delete("/platform/platform-role/:id", async (req, res) => {
    await roleService.deleteRole(req.params.id || "");
    sendJson(res, { success: true });
  });

  // --- Platform Permissions ---
  router.get("/platform/platform-permission", async (_req, res) => {
    const list = await permissionService.listPermissions();
    sendJson(res, list);
  });
  router.post("/platform/platform-permission", async (req, res) => {
    const record = await permissionService.createPermission(req.body as never);
    sendJson(res, record, 201);
  });
  router.put("/platform/platform-permission/:id", async (req, res) => {
    const record = await permissionService.updatePermission(req.params.id || "", req.body as never);
    sendJson(res, record);
  });
  router.delete("/platform/platform-permission/:id", async (req, res) => {
    await permissionService.deletePermission(req.params.id || "");
    sendJson(res, { success: true });
  });

  // --- Platform Tools ---
  router.get("/platform/platform-tool", async (_req, res) => {
    const list = await toolService.listTools();
    sendJson(res, list);
  });
  router.post("/platform/platform-tool", async (req, res) => {
    const record = await toolService.createTool(req.body as never);
    sendJson(res, record, 201);
  });
  router.put("/platform/platform-tool/:id", async (req, res) => {
    const record = await toolService.updateTool(req.params.id || "", req.body as never);
    sendJson(res, record);
  });
  router.delete("/platform/platform-tool/:id", async (req, res) => {
    await toolService.deleteTool(req.params.id || "");
    sendJson(res, { success: true });
  });

  // --- Budgets and Tenants ---
  router.get("/platform/budgets/:tenantId", async (req, res) => {
    const budget = await budgetService.getTenantBudget(req.params.tenantId || "");
    sendJson(res, budget);
  });
  router.put("/platform/budgets/:tenantId", async (req, res) => {
    const budget = await budgetService.updateTenantBudget(
      req.params.tenantId || "",
      req.body as { maxMonthlySpendUsd: number },
    );
    sendJson(res, budget);
  });
  router.get("/platform/tenants", async (_req, res) => {
    const tenants = await budgetService.listTenants();
    sendJson(res, tenants);
  });
}
