/**
 * @file apps/gateway/src/routes/rag.route.ts
 * @description REST API routes for RAG document ingestion and hybrid vector retrieval.
 */

import type { Router } from "./router";
import { RagController } from "@/controllers";

/**
 * Registers RAG ingestion and retrieval routes onto the gateway router.
 *
 * @param router - Gateway router instance
 * @param controller - RAG controller instance
 */
export function registerRagRoutes(
  router: Router,
  controller: RagController = new RagController(),
): void {
  router.post("/api/v1/rag/documents", (req, res) => controller.ingestDocument(req, res));
  router.post("/api/v1/rag/query", (req, res) => controller.query(req, res));
}
