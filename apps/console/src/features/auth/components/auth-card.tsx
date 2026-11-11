/**
 * @file apps/console/src/features/auth/components/auth-card.tsx
 * @description Glassmorphic cybernetic card container with glowing brand halo and telemetry badges.
 * @module apps/console/features/auth
 */

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

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
  badgeText = UI_COPY.AUTH.CARD.BADGE_TEXT,
  children,
}: AuthCardProps): React.JSX.Element {
  return (
    <div className="orch-auth-wrapper runner-enter">
      {/* Radiant Glow Behind Card */}
      <div className="orch-auth-glow" />

      {/* Main Glassmorphic Panel */}
      <div className="orch-auth-card" style={{ padding: "1.5rem" }}>
        {/* Top Edge Neon Shimmer Line */}
        <div className="orch-auth-shimmer-line" />

        {/* Brand Header */}
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Pulsating Monogram Halo */}
          <div style={{ position: "relative", marginBottom: "0.875rem" }}>
            <div
              style={{
                position: "absolute",
                inset: "-0.5rem",
                borderRadius: "var(--radius-md, 0.375rem)",
                backgroundColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
                filter: "blur(8px)",
              }}
            />
            <Link
              href="/"
              style={{
                position: "relative",
                display: "grid",
                height: "3rem",
                width: "3rem",
                placeItems: "center",
                borderRadius: "var(--radius-md, 0.375rem)",
                backgroundColor: "var(--primary)",
                color: "var(--primaryForeground)",
                fontFamily: "var(--font-display, sans-serif)",
                fontSize: "1.125rem",
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              aria-label={UI_COPY.AUTH.CARD.HOME_A11Y}
            >
              O
            </Link>
          </div>

          {/* Micro Telemetry Badge */}
          <div className="orch-auth-pill" style={{ marginBottom: "0.625rem" }}>
            <Sparkles
              style={{ width: "0.75rem", height: "0.75rem", animation: "spin 6s linear infinite" }}
            />
            <span>{badgeText}</span>
          </div>

          <h1
            style={{
              color: "var(--foreground)",
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: "var(--mutedForeground)",
              marginTop: "0.25rem",
              maxWidth: "20rem",
              fontSize: "0.75rem",
              lineHeight: 1.5,
              marginInline: "auto",
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Form Slot */}
        <div style={{ position: "relative" }}>{children}</div>
      </div>
    </div>
  );
}
