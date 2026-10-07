/**
 * @file apps/console/src/lib/streaming/incremental-ast-parser.ts
 * @description Incremental Markdown chunk parser caching frozen completed blocks.
 * Eliminates O(N^2) markdown re-parsing during token streaming by isolating the dynamic tail.
 * @module apps/console/lib/streaming
 */

import { DOUBLE_NEWLINE_SPLIT_REGEX } from "@orchestrai/regex";

/**
 * Structural segment of a streaming markdown document.
 */
export interface MarkdownChunk {
  readonly id: string;
  readonly content: string;
  readonly isFrozen: boolean;
  readonly isCodeBlock: boolean;
  readonly language?: string;
}

/**
 * Incremental parser that separates immutable frozen blocks from active streaming tail text.
 */
export class IncrementalAstParser {
  private frozenChunks: MarkdownChunk[] = [];
  private activeTail = "";
  private rawContent = "";

  /**
   * Ingests full accumulated streaming text and computes updated block segmentation.
   *
   * @param text - Full accumulated markdown string
   * @returns Array of chunks with frozen blocks and one dynamic streaming tail
   */
  public parse(text: string): MarkdownChunk[] {
    if (text === this.rawContent) {
      return [...this.frozenChunks, this.createTailChunk(this.activeTail)];
    }

    this.rawContent = text;
    this.recalculateChunks(text);

    const result = [...this.frozenChunks];
    if (this.activeTail.length > 0) {
      result.push(this.createTailChunk(this.activeTail));
    }
    return result;
  }

  /**
   * Scans text for completed structural blocks.
   */
  private recalculateChunks(text: string): void {
    // Check for completed fenced code blocks: ```lang\ncode\n```
    const chunks: MarkdownChunk[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)\n```/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = codeBlockRegex.lastIndex;

      // Extract preceding prose if non-empty
      if (matchStart > lastIndex) {
        const precedingText = text.slice(lastIndex, matchStart);
        this.splitParagraphs(precedingText).forEach((chunk) => chunks.push(chunk));
      }

      // Add frozen completed code block
      chunks.push({
        id: `code-${chunks.length}-${matchStart}`,
        content: match[0] ?? "",
        isFrozen: true,
        isCodeBlock: true,
        language: match[1] || undefined,
      });

      lastIndex = matchEnd;
    }

    // Remaining tail after last code block
    const remainingText = text.slice(lastIndex);
    const paragraphs = this.splitParagraphs(remainingText);

    if (paragraphs.length > 1) {
      // All but the last paragraph are completed and frozen
      for (let i = 0; i < paragraphs.length - 1; i++) {
        const p = paragraphs[i];
        if (p) {
          chunks.push(p);
        }
      }
      this.activeTail = paragraphs[paragraphs.length - 1]?.content || "";
    } else {
      this.activeTail = remainingText;
    }

    this.frozenChunks = chunks;
  }

  /**
   * Splits prose text by double newlines into completed paragraph blocks.
   */
  private splitParagraphs(text: string): MarkdownChunk[] {
    const parts = text.split(DOUBLE_NEWLINE_SPLIT_REGEX);
    return parts.map((part, index) => ({
      id: `prose-${index}-${part.slice(0, 10)}`,
      content: part,
      isFrozen: true,
      isCodeBlock: false,
    }));
  }

  /**
   * Creates a volatile, dynamic tail chunk.
   */
  private createTailChunk(tailText: string): MarkdownChunk {
    return {
      id: "streaming-tail",
      content: tailText,
      isFrozen: false,
      isCodeBlock: tailText.startsWith("```"),
    };
  }

  /**
   * Resets parser state for a new stream session.
   */
  public reset(): void {
    this.frozenChunks = [];
    this.activeTail = "";
    this.rawContent = "";
  }
}
