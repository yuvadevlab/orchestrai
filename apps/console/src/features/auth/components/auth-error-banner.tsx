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
export function AuthErrorBanner({
  message,
  variant = "coral",
}: AuthErrorBannerProps): React.JSX.Element | null {
  // If no message provided, do not render
  if (!message) {
    return null;
  }

  // Variant styling map for exploring high-contrast theme options
  const variantStyles = {
    // Coral: High-energy, warm, modern error color with stellar legibility
    coral: {
      container: "border-rose-500/30 bg-rose-950/30 text-rose-200 shadow-rose-950/20",
      icon: "text-rose-400",
    },
    // Amber: Warm golden warning-error hybrid (Linear style)
    amber: {
      container: "border-amber-500/30 bg-amber-950/30 text-amber-200 shadow-amber-950/20",
      icon: "text-amber-400",
    },
    // Orange: Punchy neon tangerine
    orange: {
      container: "border-orange-500/30 bg-orange-950/30 text-orange-200 shadow-orange-950/20",
      icon: "text-orange-400",
    },
    // Rose: Soft electric ruby / pink
    rose: {
      container: "border-pink-500/30 bg-pink-950/30 text-pink-200 shadow-pink-950/20",
      icon: "text-pink-400",
    },
  };

  const style = variantStyles[variant] ?? variantStyles.coral;

  return (
    <div
      role="alert"
      className={`animate-in fade-in slide-in-from-top-1 relative flex items-start gap-2.5 rounded-md border p-3 text-xs leading-relaxed shadow-sm backdrop-blur-md transition-all duration-200 ${style.container}`}
    >
      <AlertCircle className={`mt-0.5 size-4 shrink-0 ${style.icon}`} />
      <div className="flex-1 font-medium">{message}</div>
    </div>
  );
}
