/**
 * @file loading-state.tsx
 * @description Generic Loading component following reference typography.
 * @module apps/console/components/ui
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  /** Primary loading title */
  title?: string;
  /** Subtitle description */
  description?: string;
  /** Additional custom container styling */
  className?: string;
}

/**
 * Universal Loading State component matching reference typography.
 */
export function LoadingState({
  title = "Loading page...",
  description = "Please wait while we prepare your view.",
  className,
}: LoadingStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "bg-background flex size-full h-screen flex-col items-center justify-center p-6 text-center",
        className,
      )}
    >
      <div className="max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <Loader2 className="text-primary size-8 animate-spin" />
        </div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>
      </div>
    </div>
  );
}
