/**
 * @file empty-state.tsx
 * @description Unified, cybernetic-themed empty state component for OrchestrAI Console.
 * @module apps/console/components/ui
 */

import React from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Lucide icon component to display */
  icon?: LucideIcon;
  /** Primary title text */
  title: string;
  /** Explanatory description */
  description: string;
  /** Optional action element (button/link) */
  action?: React.ReactNode;
  /** Additional container class names */
  className?: string;
}

/**
 * Reusable cybernetic glassmorphic Empty State component.
 * Follows strict OrchestrAI theme standards (border-border, bg-card/50, font-mono captions).
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "border-border bg-card/40 relative flex min-h-55 w-full flex-col items-center justify-center rounded-md border p-8 text-center backdrop-blur-sm",
        className,
      )}
    >
      {/* Icon Badge */}
      <div className="border-primary/30 bg-primary/10 text-primary mb-3.5 grid size-11 place-items-center rounded-md border shadow-xs">
        <Icon className="size-5" />
      </div>

      {/* Text Hierarchy */}
      <h3 className="font-display text-foreground text-sm font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-1.5 max-w-sm font-mono text-xs leading-relaxed">
        {description}
      </p>

      {/* Action Button / Link if provided */}
      {action && <div className="mt-4 flex items-center justify-center">{action}</div>}
    </div>
  );
}
