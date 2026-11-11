"use client";

/**
 * @file apps/console/src/features/auth/components/auth-card-wrapper.tsx
 * @description Glassmorphic AI Neural World card container for authentication views.
 * @module apps/console/features/auth
 */

import React, { type ReactNode } from "react";
import Link from "next/link";
import { Sparkles, Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";

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
  badgeText = UI_COPY.AUTH.CARD.BADGE_TEXT,
  children,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
}: AuthCardWrapperProps): React.JSX.Element {
  return (
    <div className="orch-auth-wrapper runner-enter">
      {/* 1. Radiant Ambient Glow Beneath Card */}
      <div className="orch-auth-glow" />

      {/* 2. Glassmorphic Card Surface */}
      <Card className="orch-auth-card">
        {/* Top Edge Ambient Shimmer Line */}
        <div className="orch-auth-shimmer-line" />

        <CardHeader
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            paddingBottom: "0.75rem",
            textAlign: "center",
          }}
        >
          {/* Brand Monogram with Pulsating Neural Halo */}
          <div style={{ marginBottom: "0.25rem", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-0.5rem",
                  borderRadius: "var(--radius-md, 0.375rem)",
                  backgroundColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
                  filter: "blur(8px)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "grid",
                  height: "2.75rem",
                  width: "2.75rem",
                  placeItems: "center",
                  borderRadius: "var(--radius-md, 0.375rem)",
                  backgroundColor: "var(--primary)",
                  color: "var(--primaryForeground)",
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "1rem",
                  fontWeight: 900,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              >
                O
              </div>
            </div>
          </div>

          {/* Micro Telemetry Pill */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="orch-auth-pill">
              <Sparkles
                style={{
                  width: "0.75rem",
                  height: "0.75rem",
                  animation: "spin 8s linear infinite",
                }}
              />
              <span>{badgeText}</span>
            </div>
          </div>

          <CardTitle
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </CardTitle>
          <CardDescription
            style={{
              color: "var(--mutedForeground)",
              marginInline: "auto",
              maxWidth: "20rem",
              fontSize: "0.75rem",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {children}

          {footerLinkText && footerLinkHref && (
            <div
              style={{
                marginTop: "1rem",
                borderTop: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
                paddingTop: "1rem",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", margin: 0 }}>
                {footerPrompt}{" "}
                <Link
                  href={footerLinkHref}
                  style={{ color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          )}

          {/* Bottom Cybernetic Telemetry Footer */}
          <div className="orch-auth-footer-telemetry">
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Terminal style={{ width: "0.625rem", height: "0.625rem" }} />
              <span>{UI_COPY.AUTH.CARD.NODE_TELEMETRY}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span
                style={{
                  width: "0.375rem",
                  height: "0.375rem",
                  borderRadius: "9999px",
                  backgroundColor: "var(--primary)",
                }}
              />
              <span>{UI_COPY.AUTH.CARD.ENGINE_STATUS}</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
