/**
 * @file not-found-state.tsx
 * @description Generic 404 Not Found component matching reference design layout & typography.
 * @module apps/console/components/ui
 */

"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface NotFoundStateProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Home link path */
  homeHref?: string;
  /** Additional styling */
  className?: string;
}

/**
 * Universal 404 Not Found component matching reference typography and button layout.
 */
export function NotFoundState({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  homeHref = "/",
  className,
}: NotFoundStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "bg-background flex size-full h-screen flex-col items-center justify-center p-6 text-center",
        className,
      )}
    >
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-7xl font-bold tracking-tight sm:text-8xl">404</h1>
        <h2 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>
        <div className="mt-6">
          <Link
            href={homeHref}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
