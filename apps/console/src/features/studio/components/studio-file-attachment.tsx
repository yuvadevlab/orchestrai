"use client";

/**
 * @file apps/console/src/features/studio/components/studio-file-attachment.tsx
 * @description ChatGPT-style "+" file attachment button and uploaded document chips.
 * @module apps/console/features/studio/components
 */

import React, { useRef, useState } from "react";
import { Plus, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import { DocumentUploadStatus } from "@orchestrai/shared-types";
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
 * File attachment trigger and badge pills matching ChatGPT/Claude interface.
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
        aria-label="Upload document"
        className="hidden"
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
        className="hover:bg-accent/60 size-7 shrink-0 rounded-md transition-colors"
        title="Upload & index document (ChatGPT style)"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
        ) : (
          <Plus className={`size-4 transition-transform ${isHovered ? "rotate-90" : ""}`} />
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
    <div className="mb-2 flex flex-wrap items-center gap-1.5 px-1">
      {files.map((file) => (
        <div
          key={file.id}
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] shadow-sm transition-all ${
            file.status === DocumentUploadStatus.ERROR
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : file.status === DocumentUploadStatus.UPLOADING
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border bg-card text-foreground"
          }`}
        >
          {file.status === DocumentUploadStatus.UPLOADING ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <FileText className="text-muted-foreground size-3" />
          )}
          <span className="max-w-40 truncate font-sans font-medium">{file.name}</span>
          <span className="text-muted-foreground text-[10px]">
            ({(file.sizeBytes / 1024).toFixed(1)} KB)
          </span>
          {file.status === DocumentUploadStatus.INDEXED && (
            <span className="text-primary text-[9px] font-semibold tracking-wide uppercase">
              indexed
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="hover:bg-muted ml-0.5 rounded p-0.5 transition-colors"
            title="Remove attachment"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
