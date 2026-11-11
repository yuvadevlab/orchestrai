"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-query-dialog.tsx
 * @description Modal dialog for testing live hybrid vector queries against RAG storage.
 * @module apps/console/features/knowledge/components
 */

import React, { useState } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import {
  Button,
  Input,
  toast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useQueryKnowledge } from "../api";
import { KnowledgeQueryResults } from "./knowledge-query-results";

export interface KnowledgeQueryDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/**
 * Modal dialog for interactive vector search testing.
 */
export function KnowledgeQueryDialog({
  isOpen,
  onClose,
}: KnowledgeQueryDialogProps): React.JSX.Element | null {
  const [queryText, setQueryText] = useState("");
  const { search, results: result, isSearching, reset } = useQueryKnowledge();

  if (!isOpen) return null;

  const handleSearch = async (e?: React.SyntheticEvent): Promise<void> => {
    e?.preventDefault();
    if (!queryText.trim()) return;

    try {
      await search(queryText.trim());
    } catch {
      toast.error(UI_COPY.KNOWLEDGE.QUERY_TESTER.TOAST_ERROR);
    }
  };

  const handleClose = (): void => {
    reset();
    setQueryText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
                color: "var(--primary)",
                display: "grid",
                height: "1.75rem",
                width: "1.75rem",
                placeItems: "center",
                borderRadius: "var(--radius-md, 0.375rem)",
              }}
            >
              <Sparkles style={{ width: "1rem", height: "1rem" }} />
            </div>
            <div>
              <DialogTitle style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                {UI_COPY.KNOWLEDGE.QUERY_TESTER.TITLE}
              </DialogTitle>
              <DialogDescription
                style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", margin: 0 }}
              >
                {UI_COPY.KNOWLEDGE.QUERY_TESTER.DESCRIPTION}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingInline: "1.5rem",
            paddingBlock: "1rem",
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <Input
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={UI_COPY.KNOWLEDGE.QUERY_TESTER.PLACEHOLDER}
                startIcon={<Search style={{ width: "0.875rem", height: "0.875rem" }} />}
                style={{ height: "2rem", fontSize: "0.75rem" }}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isSearching || !queryText.trim()}
              style={{
                height: "2rem",
                cursor: "pointer",
                gap: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {isSearching ? (
                <Loader2
                  style={{
                    width: "0.875rem",
                    height: "0.875rem",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Search style={{ width: "0.875rem", height: "0.875rem" }} />
              )}
              <span>{UI_COPY.KNOWLEDGE.QUERY_TESTER.SUBMIT_BUTTON}</span>
            </Button>
          </form>

          {/* Query Results */}
          {result && <KnowledgeQueryResults result={result} />}
        </DialogBody>

        <DialogFooter style={{ padding: "0.75rem 1.5rem" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            style={{ height: "2rem", cursor: "pointer", fontSize: "0.75rem" }}
          >
            {UI_COPY.COMMON.ACTIONS.CLOSE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
