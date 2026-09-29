"use client";

/**
 * @file apps/console/src/features/studio/api/use-upload-document.ts
 * @description TanStack Query mutation hook for uploading and vector-indexing files from Studio composer.
 * @module apps/console/features/studio/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { DocumentUploadStatus, DocumentMimeType } from "@orchestrai/shared-types";

export interface UploadDocumentParams {
  file: File;
}

export interface UploadDocumentResult {
  documentId: string;
  name: string;
  sizeBytes: number;
  status: DocumentUploadStatus;
}

/**
 * Resolves file mime type to standard DocumentMimeType or plain text.
 */
function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  if (file.name.endsWith(".md")) return DocumentMimeType.MARKDOWN;
  if (file.name.endsWith(".json")) return DocumentMimeType.JSON;
  if (file.name.endsWith(".csv")) return DocumentMimeType.CSV;
  return DocumentMimeType.PLAIN_TEXT;
}

/**
 * Custom hook managing document file reading, gateway ingestion, and vector indexing.
 */
export function useUploadDocument(): UseMutationResult<
  UploadDocumentResult,
  Error,
  UploadDocumentParams
> {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: async ({ file }: UploadDocumentParams): Promise<UploadDocumentResult> => {
      const content = await file.text();
      const mimeType = resolveMimeType(file);

      const response = await client.http.request<{ documentId: string }>("/api/v1/rag/documents", {
        method: "POST",
        body: JSON.stringify({
          title: file.name,
          sourceUri: `upload://${file.name}`,
          mimeType,
          content,
          metadata: { sizeBytes: file.size, uploadedAt: new Date().toISOString() },
        }),
      });

      return {
        documentId: response?.documentId || `doc_${Date.now()}`,
        name: file.name,
        sizeBytes: file.size,
        status: DocumentUploadStatus.INDEXED,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}
