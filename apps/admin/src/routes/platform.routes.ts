/**
 * @file apps/admin/src/routes/platform.routes.ts
 * @description Operator Control Plane route registrations for providers, models, modes, and budgets.
 * @module apps/admin/routes
 */

import { Logger } from "@yuva-devlab/logger";
import { ADMIN_ROUTES, ROUTE_PARAMS, QUERY_PARAMS } from "@orchestrai/shared-types";
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

const logger = new Logger("PlatformRoutes");

const providerService = new LlmProviderAdminService();
const modelService = new LlmModelAdminService();
const modeService = new PlatformModeAdminService();
const roleService = new PlatformRoleAdminService();
const permissionService = new PlatformPermissionAdminService();
const toolService = new PlatformToolAdminService();
const budgetService = new TenantBudgetAdminService();

/**
 * Sends a standard JSON response with HTTP status code.
 *
 * @param res - Admin response stream
 * @param data - Payload to serialize
 * @param status - HTTP status code
 */
function sendJson(res: AdminResponse, data: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

/**
 * Registers all platform catalog and budget administration routes.
 *
 * @param router - Admin router instance
 */
export function registerPlatformRoutes(router: AdminRouter): void {
  // ─── LLM Providers ────────────────────────────────────────────────────────
  router.get(ADMIN_ROUTES.LLM_PROVIDER, async (_req, res) => {
    logger.info("listProviders: fetching configured LLM providers");
    const list = await providerService.listProviders();
    sendJson(res, list);
  });
  router.post(ADMIN_ROUTES.LLM_PROVIDER, async (req, res) => {
    logger.info("createProvider: registering new LLM provider");
    const record = await providerService.createProvider(req.body as never);
    sendJson(res, record, 201);
  });
  router.put(`${ADMIN_ROUTES.LLM_PROVIDER}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const providerId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("updateProvider: updating LLM provider", { providerId });
    const record = await providerService.updateProvider(providerId, req.body as never);
    sendJson(res, record);
  });
  router.delete(`${ADMIN_ROUTES.LLM_PROVIDER}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const providerId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deleteProvider: removing LLM provider", { providerId });
    await providerService.deleteProvider(providerId);
    sendJson(res, { success: true });
  });

  // ─── LLM Models ───────────────────────────────────────────────────────────
  router.get(ADMIN_ROUTES.LLM_MODEL, async (req, res) => {
    const providerId = req.query[QUERY_PARAMS.PROVIDER_ID];
    logger.info("listModels: querying LLM models", { providerId });
    const list = await modelService.listModels(providerId);
    sendJson(res, list);
  });
  router.post(ADMIN_ROUTES.LLM_MODEL, async (req, res) => {
    logger.info("createModel: registering new LLM model");
    const record = await modelService.createModel(req.body as never);
    sendJson(res, record, 201);
  });
  router.put(`${ADMIN_ROUTES.LLM_MODEL}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const modelId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("updateModel: updating LLM model", { modelId });
    const record = await modelService.updateModel(modelId, req.body as never);
    sendJson(res, record);
  });
  router.delete(`${ADMIN_ROUTES.LLM_MODEL}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const modelId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deleteModel: removing LLM model", { modelId });
    await modelService.deleteModel(modelId);
    sendJson(res, { success: true });
  });

  // ─── Platform Modes ───────────────────────────────────────────────────────
  router.get(ADMIN_ROUTES.PLATFORM_MODE, async (_req, res) => {
    logger.info("listModes: querying platform execution modes");
    const list = await modeService.listModes();
    sendJson(res, list);
  });
  router.post(ADMIN_ROUTES.PLATFORM_MODE, async (req, res) => {
    logger.info("createMode: creating execution mode");
    const record = await modeService.createMode(req.body as never);
    sendJson(res, record, 201);
  });
  router.put(`${ADMIN_ROUTES.PLATFORM_MODE}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const modeId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("updateMode: updating execution mode", { modeId });
    const record = await modeService.updateMode(modeId, req.body as never);
    sendJson(res, record);
  });
  router.delete(`${ADMIN_ROUTES.PLATFORM_MODE}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const modeId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deleteMode: removing execution mode", { modeId });
    await modeService.deleteMode(modeId);
    sendJson(res, { success: true });
  });

  // ─── Platform Roles ───────────────────────────────────────────────────────
  router.get(ADMIN_ROUTES.PLATFORM_ROLE, async (_req, res) => {
    logger.info("listRoles: querying platform agent roles");
    const list = await roleService.listRoles();
    sendJson(res, list);
  });
  router.post(ADMIN_ROUTES.PLATFORM_ROLE, async (req, res) => {
    logger.info("createRole: creating agent role");
    const record = await roleService.createRole(req.body as never);
    sendJson(res, record, 201);
  });
  router.put(`${ADMIN_ROUTES.PLATFORM_ROLE}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const roleId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("updateRole: updating agent role", { roleId });
    const record = await roleService.updateRole(roleId, req.body as never);
    sendJson(res, record);
  });
  router.delete(`${ADMIN_ROUTES.PLATFORM_ROLE}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const roleId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deleteRole: removing agent role", { roleId });
    await roleService.deleteRole(roleId);
    sendJson(res, { success: true });
  });

  // ─── Platform Permissions ─────────────────────────────────────────────────
  router.get(ADMIN_ROUTES.PLATFORM_PERMISSION, async (_req, res) => {
    logger.info("listPermissions: querying tool permission tiers");
    const list = await permissionService.listPermissions();
    sendJson(res, list);
  });
  router.post(ADMIN_ROUTES.PLATFORM_PERMISSION, async (req, res) => {
    logger.info("createPermission: creating tool permission tier");
    const record = await permissionService.createPermission(req.body as never);
    sendJson(res, record, 201);
  });
  router.put(`${ADMIN_ROUTES.PLATFORM_PERMISSION}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const permissionId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("updatePermission: updating permission tier", { permissionId });
    const record = await permissionService.updatePermission(permissionId, req.body as never);
    sendJson(res, record);
  });
  router.delete(`${ADMIN_ROUTES.PLATFORM_PERMISSION}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const permissionId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deletePermission: removing permission tier", { permissionId });
    await permissionService.deletePermission(permissionId);
    sendJson(res, { success: true });
  });

  // ─── Platform Tools ───────────────────────────────────────────────────────
  router.get(ADMIN_ROUTES.PLATFORM_TOOL, async (_req, res) => {
    logger.info("listTools: querying platform tools");
    const list = await toolService.listTools();
    sendJson(res, list);
  });
  router.post(ADMIN_ROUTES.PLATFORM_TOOL, async (req, res) => {
    logger.info("createTool: registering platform tool");
    const record = await toolService.createTool(req.body as never);
    sendJson(res, record, 201);
  });
  router.put(`${ADMIN_ROUTES.PLATFORM_TOOL}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const toolId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("updateTool: updating platform tool", { toolId });
    const record = await toolService.updateTool(toolId, req.body as never);
    sendJson(res, record);
  });
  router.delete(`${ADMIN_ROUTES.PLATFORM_TOOL}/:${ROUTE_PARAMS.ID}`, async (req, res) => {
    const toolId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deleteTool: removing platform tool", { toolId });
    await toolService.deleteTool(toolId);
    sendJson(res, { success: true });
  });

  // ─── Budgets & Tenants ────────────────────────────────────────────────────
  router.get(`${ADMIN_ROUTES.BUDGETS}/:${ROUTE_PARAMS.TENANT_ID}`, async (req, res) => {
    const tenantId = req.params[ROUTE_PARAMS.TENANT_ID] || "";
    logger.info("getTenantBudget: querying tenant budget", { tenantId });
    const budget = await budgetService.getTenantBudget(tenantId);
    sendJson(res, budget);
  });
  router.put(`${ADMIN_ROUTES.BUDGETS}/:${ROUTE_PARAMS.TENANT_ID}`, async (req, res) => {
    const tenantId = req.params[ROUTE_PARAMS.TENANT_ID] || "";
    logger.info("updateTenantBudget: updating tenant budget allocation", { tenantId });
    const budget = await budgetService.updateTenantBudget(
      tenantId,
      req.body as { maxMonthlySpendUsd: number },
    );
    sendJson(res, budget);
  });
  router.get(ADMIN_ROUTES.TENANTS, async (_req, res) => {
    logger.info("listTenants: listing platform tenant partitions");
    const tenants = await budgetService.listTenants();
    sendJson(res, tenants);
  });
}
