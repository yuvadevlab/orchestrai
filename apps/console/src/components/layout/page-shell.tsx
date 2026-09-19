import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";

export interface PageShellProps {
  title: string;
  breadcrumb?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page container for all Console routes.
 * Provides the signature breadcrumb header, typography hierarchy, and scroll area.
 */
export function PageShell({
  title,
  breadcrumb,
  description,
  actions,
  children,
  className,
}: PageShellProps): React.JSX.Element {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Sticky Header */}
      <header className="border-border bg-background/95 shrink-0 border-b px-4 py-3 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <Breadcrumb className="mb-1">
              <BreadcrumbList className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">OrchestrAI</BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumb ? (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : null}
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="font-display text-lg leading-tight font-semibold">{title}</h1>
          </div>
          {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
        </div>
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-3xl text-xs">{description}</p>
        ) : null}
      </header>

      {/* Main Viewport Content */}
      <main className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6", className)}>
        {children}
      </main>
    </div>
  );
}
