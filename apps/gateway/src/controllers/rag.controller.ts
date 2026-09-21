/**
 * @file apps/gateway/src/controllers/rag.controller.ts
 * @description HTTP controller mediating RAG document ingestion and vector search requests.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { IngestDocumentSchema, QueryRagSchema } from "@/validation";
import { RagService } from "@/services";

/**
 * Controller managing RAG endpoints.
 */
export class RagController {
  constructor(private readonly service: RagService = new RagService()) {}

  /**
   * Ingests a new document for chunking and vector storage.
   */
  public async ingestDocument(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = IngestDocumentSchema.parse(req.body);
    const result = await this.service.ingestDocument(dto, req.context.tenantId);
    sendJson(res, 202, result);
  }

  /**
   * Executes a vector search query.
   */
  public async query(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = QueryRagSchema.parse(req.body);
    const result = await this.service.query(dto, req.context.tenantId);
    sendJson(res, 200, result);
  }
}
