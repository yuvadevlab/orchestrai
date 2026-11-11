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
import { Button } from "@orchestrai/ui";
import { LANGUAGE_CLASS_REGEX, STRIP_TOOL_CALLS_REGEX } from "@orchestrai/regex";

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
  const match = LANGUAGE_CLASS_REGEX.exec(className || "");
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
    <div className="orch-codeblock">
      <div className="orch-codeblock__header">
        <span style={{ textTransform: "uppercase", color: "var(--mutedForeground)" }}>
          {language || "code"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          style={{
            height: "1.5rem",
            gap: "0.25rem",
            paddingInline: "0.5rem",
            fontSize: "0.625rem",
            color: "var(--mutedForeground)",
          }}
        >
          {copied ? (
            <Check style={{ width: "0.75rem", height: "0.75rem", color: "var(--primary)" }} />
          ) : (
            <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="orch-codeblock__pre">
        <code>{codeString}</code>
      </pre>
    </div>
  );
}

function cleanMarkdownContent(raw: string): string {
  if (!raw) return "";
  // Strip raw tool_call markdown blocks
  return raw.replace(STRIP_TOOL_CALLS_REGEX, "").trim();
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
    <div className={`orch-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1>{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => <blockquote>{children}</blockquote>,
          code: ({ className: codeClass, children, ...props }) => {
            const isInline = !codeClass && !String(children).includes("\n");
            if (isInline) {
              return <code {...props}>{children}</code>;
            }
            return <CodeBlock className={codeClass}>{children}</CodeBlock>;
          },
          table: ({ children }) => <table>{children}</table>,
          th: ({ children }) => <th>{children}</th>,
          td: ({ children }) => <td>{children}</td>,
          hr: () => <hr />,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
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
