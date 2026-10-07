/**
 * @file apps/gateway/src/controllers/rag.controller.ts
 * @description HTTP controller mediating RAG document ingestion and vector search requests.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { IngestDocumentSchema, QueryRagSchema } from "@/validation";
import { RagService, ragService } from "./rag.service";
import { ErrorCode, ROUTE_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("RagController"));

/**
 * Controller managing RAG document ingestion, indexing, and vector search endpoints.
 */
export class RagController {
  constructor(private readonly service: RagService = ragService) {}

  /**
   * Ingests a new document for chunking and vector storage.
   *
   * @param req - Inbound gateway HTTP request containing IngestDocumentSchema payload.
   * @param res - Outbound gateway HTTP response delivering accepted ingestion task (202 Accepted).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async ingestDocument(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Validate document payload schema
    const dto = IngestDocumentSchema.parse(req.body);
    logger.info("ingestDocument: queuing document ingestion", {
      title: dto.title,
      tenantId: req.context.tenantId,
    });

    // Delegate document parsing, chunking, and embedding to domain service
    const result = await this.service.ingestDocument(dto, req.context.tenantId);
    sendJson(res, 202, result);
  }

  /**
   * Executes a vector search query against tenant knowledge embeddings.
   *
   * @param req - Inbound gateway HTTP request containing QueryRagSchema payload.
   * @param res - Outbound gateway HTTP response sending matched context chunks.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async query(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Validate query text and topK limits
    const dto = QueryRagSchema.parse(req.body);
    logger.info("query: executing vector search query", {
      query: dto.query,
      limit: dto.limit,
      tenantId: req.context.tenantId,
    });

    // Execute semantic cosine similarity query over vector store
    const result = await this.service.query(dto, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Lists all indexed documents for the authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request.
   * @param res - Outbound gateway HTTP response sending document metadata records.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listDocuments(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    logger.info("listDocuments: listing indexed documents", {
      tenantId: req.context.tenantId,
    });

    // Query indexed documents scoped to current tenant
    const docs = await this.service.listDocuments(req.context.tenantId);
    sendJson(res, 200, { documents: docs, total: docs.length });
  }

  /**
   * Deletes an indexed document and its associated vector chunks.
   *
   * @param req - Inbound gateway HTTP request containing document ID param.
   * @param res - Outbound gateway HTTP response confirming deletion.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async deleteDocument(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const id = req.params[ROUTE_PARAMS.ID];
    // Guard: Verify document ID presence in request parameters
    if (!id) {
      logger.warn("deleteDocument: missing document id parameter");
      sendJson(res, 400, {
        error: { code: ErrorCode.BAD_REQUEST, message: "Missing document id parameter" },
      });
      return;
    }

    logger.info("deleteDocument: removing indexed document", { id });
    // Remove document and vector embeddings from storage
    const success = await this.service.deleteDocument(id);
    sendJson(res, 200, { success, documentId: id });
  }
}
