/**
 * @file empty-state.tsx
 * @description Unified, cybernetic-themed empty state component for OrchestrAI Console.
 * @module apps/console/components/ui
 * @author yuva.devlab@gmail.com
 */

import React from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

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
 * Follows strict OrchestrAI theme standards.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className={cn("orch-empty-state", className)}>
      {/* Icon Badge */}
      <div className="orch-empty-state__icon-badge">
        <Icon style={{ width: "1.25rem", height: "1.25rem" }} />
      </div>

      {/* Text Hierarchy */}
      <h3 className="orch-empty-state__title">{title}</h3>
      <p className="orch-empty-state__description">{description}</p>

      {/* Action Button / Link if provided */}
      {action && <div className="orch-empty-state__action">{action}</div>}
    </div>
  );
}
