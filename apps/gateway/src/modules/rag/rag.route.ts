/**
 * @file apps/gateway/src/routes/rag.route.ts
 * @description REST API routes for RAG document ingestion and hybrid vector retrieval.
 */

import type { RouteGroup } from "@/routes/router";
import { RagController } from "./rag.controller";

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
    group.get("/documents", (req, res) => controller.listDocuments(req, res));
    group.post("/documents", (req, res) => controller.ingestDocument(req, res));
    group.delete("/documents/:id", (req, res) => controller.deleteDocument(req, res));
    group.post("/query", (req, res) => controller.query(req, res));
  });
}
