/**
 * @file apps/gateway/src/routes/rag.route.ts
 * @description REST API routes for RAG document ingestion and hybrid vector retrieval.
 */

import type { RouteGroup } from "./router";
import { RagController } from "@/controllers";

/**
 * Registers RAG ingestion and retrieval routes onto the gateway router scoped under /rag.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - RAG controller instance
 */
export function registerRagRoutes(
  api: RouteGroup,
  controller: RagController = new RagController(),
): void {
  api.group("/rag", (group) => {
    group.post("/documents", (req, res) => controller.ingestDocument(req, res));
    group.post("/query", (req, res) => controller.query(req, res));
  });
}
