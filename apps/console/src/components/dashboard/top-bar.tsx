"use client";

/**
 * @file top-bar.tsx
 * @description Operational telemetry indicators, live tenant identity, theme toggles, guide drawer, and auth controls.
 * @module apps/console/components/dashboard
 * @author yuva.devlab@gmail.com
 */

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Badge, useTheme } from "@orchestrai/ui";
import { Sun, Moon, Cpu, Zap, LogIn, LogOut, User } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import { useAuth } from "@/lib/auth";

/**
 * TopBar component for OrchestrAI Console.
 * Houses operational telemetry indicators, live queue status, active tenant, and auth actions.
 */
export function TopBar(): React.JSX.Element {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="orch-topbar">
      {/* Telemetry Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <Badge
          variant="outline"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.25rem 0.625rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            borderColor: "color-mix(in oklab, var(--primary) 40%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--primary) 5%, transparent)",
          }}
        >
          <span
            style={{
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "9999px",
              backgroundColor: "var(--primary)",
            }}
            className="orch-animate-pulse"
          />
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            {UI_COPY.COMMON.A11Y.GATEWAY_ACTIVE}
          </span>
          <span style={{ color: "var(--mutedForeground)" }}>
            · {UI_COPY.COMMON.A11Y.LOCAL_CORE}
          </span>
        </Badge>

        <Badge
          variant="secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.25rem 0.625rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
          }}
        >
          <Cpu style={{ width: "0.875rem", height: "0.875rem", color: "var(--mutedForeground)" }} />
          <span>{UI_COPY.COMMON.A11Y.OUTBOX_BUS_CONNECTED}</span>
        </Badge>

        {isAuthenticated && user && (
          <Badge
            variant="outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.25rem 0.625rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
            }}
          >
            <User style={{ width: "0.75rem", height: "0.75rem", color: "var(--primary)" }} />
            <span>{user.name}</span>
          </Badge>
        )}
      </div>

      {/* Action Controls */}
      <div className="orch-topbar__actions">
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={
            resolvedTheme === "dark"
              ? UI_COPY.COMMON.A11Y.SWITCH_LIGHT
              : UI_COPY.COMMON.A11Y.SWITCH_DARK
          }
          style={{
            height: "2rem",
            cursor: "pointer",
            display: "inline-flex",
            gap: "0.375rem",
            paddingInline: "0.625rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
          }}
        >
          {resolvedTheme === "dark" ? (
            <>
              <Sun style={{ width: "0.875rem", height: "0.875rem" }} />
              <span>{UI_COPY.COMMON.THEME.LIGHT}</span>
            </>
          ) : (
            <>
              <Moon style={{ width: "0.875rem", height: "0.875rem" }} />
              <span>{UI_COPY.COMMON.THEME.DARK}</span>
            </>
          )}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => router.push("/console")}
          style={{
            height: "2rem",
            cursor: "pointer",
            display: "inline-flex",
            gap: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          <Zap style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>{UI_COPY.COMMON.A11Y.NEW_EXECUTION}</span>
        </Button>

        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            style={{
              height: "2rem",
              cursor: "pointer",
              display: "inline-flex",
              gap: "0.375rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              color: "var(--mutedForeground)",
            }}
            title={UI_COPY.COMMON.A11Y.SIGN_OUT_SESSION}
          >
            <LogOut style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>{UI_COPY.COMMON.A11Y.SIGN_OUT_BTN}</span>
          </Button>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              style={{
                height: "2rem",
                cursor: "pointer",
                display: "inline-flex",
                gap: "0.375rem",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
              }}
            >
              <LogIn style={{ width: "0.875rem", height: "0.875rem" }} />
              <span>{UI_COPY.COMMON.A11Y.SIGN_IN}</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
