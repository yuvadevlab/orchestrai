"use client";

/**
 * @file apps/console/src/components/markdown-renderer.tsx
 * @description Rich Markdown renderer with code blocks, tables, and typography formatting.
 * @module apps/console/components
 */

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { Button } from "@yuva-devlab/ui";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps): React.JSX.Element | null {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  // Hide raw tool_call blocks as they are rendered via dedicated Artifact Cards
  if (language === "tool_call") {
    return null;
  }

  const handleCopy = (): void => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-border/60 bg-muted/40 my-3 overflow-hidden rounded-md border font-mono text-xs shadow-xs">
      <div className="border-border/40 bg-muted/70 flex items-center justify-between border-b px-3 py-1.5 text-[11px]">
        <span className="text-muted-foreground uppercase">{language || "code"}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-[10px]"
        >
          {copied ? <Check className="text-primary size-3" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="text-foreground overflow-x-auto p-3.5 leading-relaxed">
        <code>{codeString}</code>
      </pre>
    </div>
  );
}

function cleanMarkdownContent(raw: string): string {
  if (!raw) return "";
  // Strip raw tool_call markdown blocks
  return raw.replace(/```(?:tool_call|json)\s*\n?\{[\s\S]*?"tool"[\s\S]*?\}\s*\n?```/g, "").trim();
}

/**
 * Standard Markdown formatter component for rich conversation and agent responses.
 */
export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps): React.JSX.Element {
  const sanitized = cleanMarkdownContent(content);

  return (
    <div className={`prose dark:prose-invert max-w-none text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-foreground mt-4 mb-2 text-lg font-bold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-foreground mt-3 mb-1.5 text-base font-semibold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-foreground mt-2 mb-1 text-sm font-semibold">{children}</h3>
          ),
          p: ({ children }) => <p className="text-foreground my-1.5 leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="text-foreground my-2 ml-4 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="text-foreground my-2 ml-4 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-primary/40 bg-muted/20 text-muted-foreground my-2 border-l-2 py-1 pr-2 pl-3 italic">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const isInline = !codeClass && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="border-border/60 bg-muted/60 text-foreground rounded-md border px-1.5 py-0.5 font-mono text-[12px]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={codeClass}>{children}</CodeBlock>;
          },
          table: ({ children }) => (
            <div className="border-border/60 my-3 overflow-x-auto rounded-md border">
              <table className="w-full text-left font-mono text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-border/60 bg-muted/60 text-foreground border-b px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-border/40 border-b px-3 py-2">{children}</td>,
          hr: () => <hr className="border-border/60 my-4" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  );
}
