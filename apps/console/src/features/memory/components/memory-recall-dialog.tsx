"use client";

/**
 * @file apps/console/src/features/memory/components/memory-recall-dialog.tsx
 * @description Modal dialog for testing agent semantic memory recall and reflection matching.
 * @module apps/console/features/memory/components
 */

import React, { useState } from "react";
import { Search, Loader2, Sparkles, Brain } from "lucide-react";
import {
  Button,
  Input,
  toast,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@yuva-devlab/ui";
import { useSearchMemories } from "../api";
import type { ScoredMemoryResult } from "../types";

export interface MemoryRecallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal dialog for interactive memory recall testing.
 */
export function MemoryRecallDialog({
  isOpen,
  onClose,
}: MemoryRecallDialogProps): React.JSX.Element | null {
  const [queryText, setQueryText] = useState("");
  const { recall, results, isRecalling, reset } = useSearchMemories();

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();
    if (!queryText.trim()) return;

    try {
      await recall(queryText.trim());
    } catch {
      toast.error("Failed to query memory store");
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
              <DialogTitle className="text-base font-semibold">Memory Recall Tester</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Test semantic recall matching what agents will see during session prompt synthesis.
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
                placeholder="Enter a prompt to recall associated agent memories..."
                startIcon={<Search className="size-3.5" />}
                className="bg-card h-8 text-xs"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isRecalling || !queryText.trim()}
              className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
            >
              {isRecalling ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Search className="size-3.5" />
              )}
              <span>Recall</span>
            </Button>
          </form>

          {/* Results list */}
          {results !== null && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono">
                  Recalled {results.length} memories for &quot;{queryText}&quot;
                </span>
              </div>

              {results.length === 0 ? (
                <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded border py-6 text-center">
                  <Brain className="text-muted-foreground mb-2 size-6" />
                  <p className="text-muted-foreground text-xs">
                    No relevant memories recalled above relevance threshold.
                  </p>
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {(results as ScoredMemoryResult[]).map((match, idx) => {
                    const item = match.item;
                    const score = Math.round(match.score * 100);

                    return (
                      <div
                        key={item.memoryId || idx}
                        className="border-border/80 bg-background/80 rounded border p-3 text-xs shadow-sm"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {item.memoryType}
                            </Badge>
                          </div>
                          <span className="text-primary font-mono text-[10px] font-semibold">
                            {score}% match
                          </span>
                        </div>
                        <p className="text-foreground/90 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                          {item.content}
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
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
