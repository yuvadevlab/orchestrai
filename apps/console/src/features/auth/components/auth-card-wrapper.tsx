"use client";

/**
 * @file apps/console/src/features/auth/components/auth-card-wrapper.tsx
 * @description Glassmorphic AI Neural World card container for authentication views.
 * @module apps/console/features/auth
 */

import React, { type ReactNode } from "react";
import Link from "next/link";
import { Sparkles, Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@yuva-devlab/ui";

export interface AuthCardWrapperProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  children: ReactNode;
  footerPrompt?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

/**
 * Structured glassmorphic card wrapping authentication forms with radiant AI ambiance.
 */
export function AuthCardWrapper({
  title,
  subtitle,
  badgeText = "AI OPERATOR ACCESS",
  children,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
}: AuthCardWrapperProps): React.JSX.Element {
  return (
    <div className="runner-enter relative mx-auto w-full max-w-sm sm:max-w-md">
      {/* 1. Radiant Ambient Glow Beneath Card */}
      <div className="bg-primary/20 pointer-events-none absolute -inset-1 rounded-md blur-2xl" />

      {/* 2. Glassmorphic Card Surface */}
      <Card className="border-border/80 bg-card/80 relative overflow-hidden rounded-md border shadow-2xl shadow-black/40 backdrop-blur-2xl">
        {/* Top Edge Ambient Shimmer Line */}
        <div className="via-primary/70 absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent to-transparent" />

        <CardHeader className="space-y-2 pb-3 text-center">
          {/* Brand Monogram with Pulsating Neural Halo */}
          <div className="mb-1 flex justify-center">
            <div className="relative">
              <div className="bg-primary/30 absolute -inset-2 animate-pulse rounded-md blur-md" />
              <div className="bg-primary text-primary-foreground font-display relative grid size-11 place-items-center rounded-md text-base font-black shadow-lg">
                O
              </div>
            </div>
          </div>

          {/* Micro Telemetry Pill */}
          <div className="flex justify-center">
            <div className="bg-primary/10 border-primary/30 text-primary flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase">
              <Sparkles className="size-3 animate-spin" style={{ animationDuration: "8s" }} />
              <span>{badgeText}</span>
            </div>
          </div>

          <CardTitle className="font-display text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground mx-auto max-w-xs text-xs leading-relaxed">
            {subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {children}

          {footerLinkText && footerLinkHref && (
            <div className="border-border/60 mt-4 border-t pt-4 text-center">
              <p className="text-muted-foreground text-xs">
                {footerPrompt}{" "}
                <Link
                  href={footerLinkHref}
                  className="text-primary font-medium transition-colors hover:underline"
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          )}

          {/* Bottom Cybernetic Telemetry Footer */}
          <div className="border-border/40 text-muted-foreground/50 mt-4 flex items-center justify-between border-t pt-3 font-mono text-[9px]">
            <span className="flex items-center gap-1">
              <Terminal className="size-2.5" />
              <span>ORCH-NODE-V1</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-primary size-1.5 animate-pulse rounded-full" />
              <span>ENGINE: READY</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
