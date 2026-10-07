"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-query-dialog.tsx
 * @description Modal dialog for testing live hybrid vector queries against RAG storage.
 * @module apps/console/features/knowledge/components
 */

import React, { useState } from "react";
import { Search, Loader2, Sparkles, Database } from "lucide-react";
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
} from "@yuva-devlab/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useQueryKnowledge } from "../api";

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

  const handleSearch = async (e?: React.FormEvent): Promise<void> => {
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
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary grid size-7 place-items-center rounded-md">
              <Sparkles className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {UI_COPY.KNOWLEDGE.QUERY_TESTER.TITLE}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                {UI_COPY.KNOWLEDGE.QUERY_TESTER.DESCRIPTION}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 px-6 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={UI_COPY.KNOWLEDGE.QUERY_TESTER.PLACEHOLDER}
                startIcon={<Search className="size-3.5" />}
                className="bg-card h-8 text-xs"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isSearching || !queryText.trim()}
              className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
            >
              {isSearching ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Search className="size-3.5" />
              )}
              <span>{UI_COPY.KNOWLEDGE.QUERY_TESTER.SUBMIT_BUTTON}</span>
            </Button>
          </form>

          {/* Query Results */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono">
                  {UI_COPY.KNOWLEDGE.QUERY_TESTER.MATCHES_COUNT(result.chunks.length, result.query)}
                </span>
              </div>

              {result.chunks.length === 0 ? (
                <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded border py-6 text-center">
                  <Database className="text-muted-foreground mb-2 size-6" />
                  <p className="text-muted-foreground text-xs">
                    {UI_COPY.KNOWLEDGE.QUERY_TESTER.NO_MATCHES}
                  </p>
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {result.chunks.map((chunk, idx) => {
                    const scorePercent = Math.round(chunk.score * 100);
                    return (
                      <div
                        key={chunk.chunkId || idx}
                        className="border-border/80 bg-background/80 rounded border p-3 text-xs shadow-sm"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-muted-foreground font-mono text-[11px]">
                            Chunk #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                              <div
                                className="bg-primary h-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(0, scorePercent))}%` }}
                              />
                            </div>
                            <span className="text-primary font-mono text-[10px] font-semibold">
                              {scorePercent}% match
                            </span>
                          </div>
                        </div>
                        <p className="text-foreground/90 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                          {chunk.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter className="px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-8 cursor-pointer text-xs"
          >
            {UI_COPY.COMMON.ACTIONS.CLOSE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
