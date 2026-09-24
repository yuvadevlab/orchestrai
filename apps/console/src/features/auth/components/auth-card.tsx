/**
 * @file apps/console/src/features/auth/components/auth-card.tsx
 * @description Glassmorphic cybernetic card container with glowing brand halo and telemetry badges.
 * @module apps/console/features/auth
 */

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export interface AuthCardProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  children: React.ReactNode;
}

/**
 * Premium glassmorphic card component with radiant AI border, brand monogram,
 * and responsive entrance animation.
 */
export function AuthCard({
  title,
  subtitle,
  badgeText = "AI OPERATOR ACCESS",
  children,
}: AuthCardProps): React.JSX.Element {
  return (
    <div className="runner-enter relative z-10 mx-auto w-full max-w-md">
      {/* Radiant Glow Behind Card */}
      <div className="bg-primary/20 pointer-events-none absolute -inset-1 rounded-md blur-xl" />

      {/* Main Glassmorphic Panel */}
      <div className="border-border/80 bg-card/85 relative overflow-hidden rounded-md border p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
        {/* Top Edge Neon Shimmer Line */}
        <div className="via-primary/60 absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent to-transparent" />

        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* Pulsating Monogram Halo */}
          <div className="relative mb-3.5">
            <div className="bg-primary/30 absolute -inset-2 animate-pulse rounded-md blur-md" />
            <Link
              href="/"
              className="bg-primary text-primary-foreground font-display relative grid size-12 place-items-center rounded-md text-lg font-black shadow-lg transition-transform hover:scale-105"
              aria-label="OrchestrAI Home"
            >
              O
            </Link>
          </div>

          {/* Micro Telemetry Badge */}
          <div className="bg-primary/10 border-primary/30 text-primary mb-2.5 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase">
            <Sparkles className="size-3 animate-spin" style={{ animationDuration: "6s" }} />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-relaxed">{subtitle}</p>
        </div>

        {/* Form Slot */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
