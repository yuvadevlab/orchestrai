"use client";

/**
 * @file apps/console/src/features/auth/components/auth-error-banner.tsx
 * @description High-contrast, theme-optimized error banner for enhanced readability in dark theme.
 * @module apps/console/features/auth/components
 */

import React from "react";
import { AlertCircle } from "lucide-react";

export interface AuthErrorBannerProps {
  /** Error message string to display */
  message: string | null;
  /** Color theme variant for error display */
  variant?: "coral" | "amber" | "orange" | "rose";
}

/**
 * High-contrast, ultra-readable error alert component replacing low-visibility dark red.
 * Designed with luminous accents and high-visibility text on dark surfaces.
 */
export function AuthErrorBanner({ message }: AuthErrorBannerProps): React.JSX.Element | null {
  // If no message provided, do not render
  if (!message) {
    return null;
  }

  return (
    <div role="alert" className="orch-auth-error">
      <AlertCircle
        style={{ marginTop: "0.125rem", width: "1rem", height: "1rem", flexShrink: 0 }}
      />
      <div style={{ flex: 1, fontWeight: 500 }}>{message}</div>
    </div>
  );
}
