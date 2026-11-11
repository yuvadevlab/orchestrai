"use client";

/**
 * @file apps/console/src/features/studio/components/studio-file-attachment.tsx
 * @description File attachment button and uploaded document chips for Studio.
 * @module apps/console/features/studio/components
 */

import React, { useRef, useState } from "react";
import { Plus, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@orchestrai/ui";
import { DocumentUploadStatus } from "@orchestrai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";
import { useUploadDocument } from "../api";

export interface AttachedFile {
  id: string;
  name: string;
  sizeBytes: number;
  status: DocumentUploadStatus;
  error?: string;
}

export interface StudioFileAttachmentProps {
  onFileUploaded: (file: AttachedFile) => void;
  disabled?: boolean;
}

/**
 * File attachment trigger and badge pills matching Cowork interface.
 */
export function StudioFileAttachment({
  onFileUploaded,
  disabled = false,
}: StudioFileAttachmentProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const uploadMutation = useUploadDocument();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempId = `doc_${Date.now()}`;
    const newAttached: AttachedFile = {
      id: tempId,
      name: file.name,
      sizeBytes: file.size,
      status: DocumentUploadStatus.UPLOADING,
    };
    onFileUploaded(newAttached);

    try {
      const result = await uploadMutation.mutateAsync({ file });
      onFileUploaded({
        id: result.documentId,
        name: result.name,
        sizeBytes: result.sizeBytes,
        status: DocumentUploadStatus.INDEXED,
      });
    } catch (err) {
      onFileUploaded({
        ...newAttached,
        status: DocumentUploadStatus.ERROR,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        aria-label={UI_COPY.STUDIO.FILE.UPLOAD_A11Y}
        style={{ display: "none" }}
        accept=".txt,.md,.json,.csv,.ts,.js,.tsx,.jsx,.py,.html,.css,.yaml,.yml"
        onChange={handleFileSelect}
        disabled={disabled || uploadMutation.isPending}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploadMutation.isPending}
        style={{
          width: "1.75rem",
          height: "1.75rem",
          flexShrink: 0,
          borderRadius: "var(--radius-md, 0.375rem)",
        }}
        title={UI_COPY.STUDIO.FILE.UPLOAD_TOOLTIP}
        aria-label={UI_COPY.STUDIO.FILE.UPLOAD_A11Y}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {uploadMutation.isPending ? (
          <Loader2
            className="orch-text-muted orch-animate-spin"
            style={{ width: "1rem", height: "1rem" }}
          />
        ) : (
          <Plus
            style={{
              width: "1rem",
              height: "1rem",
              transition: "transform 0.15s ease",
              transform: isHovered ? "rotate(90deg)" : "none",
            }}
          />
        )}
      </Button>
    </>
  );
}

/**
 * Renders attached file badges above the prompt input bar.
 */
export function StudioAttachedFilesList({
  files,
  onRemove,
}: {
  files: AttachedFile[];
  onRemove: (id: string) => void;
}): React.JSX.Element | null {
  if (files.length === 0) return null;

  return (
    <div
      style={{
        marginBottom: "0.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0 0.25rem",
      }}
    >
      {files.map((file) => (
        <div
          key={file.id}
          className="orch-file-chip"
          style={{
            borderColor:
              file.status === DocumentUploadStatus.ERROR
                ? "color-mix(in oklab, var(--destructive) 40%, transparent)"
                : file.status === DocumentUploadStatus.UPLOADING
                  ? "color-mix(in oklab, var(--primary) 30%, transparent)"
                  : undefined,
            backgroundColor:
              file.status === DocumentUploadStatus.ERROR
                ? "color-mix(in oklab, var(--destructive) 10%, transparent)"
                : file.status === DocumentUploadStatus.UPLOADING
                  ? "color-mix(in oklab, var(--primary) 5%, transparent)"
                  : undefined,
            color:
              file.status === DocumentUploadStatus.ERROR
                ? "var(--destructive)"
                : file.status === DocumentUploadStatus.UPLOADING
                  ? "var(--primary)"
                  : "inherit",
          }}
        >
          {file.status === DocumentUploadStatus.UPLOADING ? (
            <Loader2
              style={{ width: "0.75rem", height: "0.75rem" }}
              className="orch-animate-spin"
            />
          ) : (
            <FileText className="orch-text-muted" style={{ width: "0.75rem", height: "0.75rem" }} />
          )}
          <span className="orch-truncate" style={{ maxWidth: "10rem", fontWeight: 500 }}>
            {file.name}
          </span>
          <span className="orch-text-muted" style={{ fontSize: "0.625rem" }}>
            ({(file.sizeBytes / 1024).toFixed(1)} KB)
          </span>
          {file.status === DocumentUploadStatus.INDEXED && (
            <span
              className="orch-text-primary"
              style={{
                fontSize: "0.5625rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {UI_COPY.STUDIO.FILE.INDEXED}
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            style={{
              marginLeft: "0.125rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.125rem",
              color: "inherit",
            }}
            title={UI_COPY.STUDIO.FILE.REMOVE_TOOLTIP}
            aria-label={UI_COPY.STUDIO.FILE.REMOVE_TOOLTIP}
          >
            <X style={{ width: "0.75rem", height: "0.75rem" }} />
          </button>
        </div>
      ))}
    </div>
  );
}
