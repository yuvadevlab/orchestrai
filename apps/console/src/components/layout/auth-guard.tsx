"use client";

/**
 * @file auth-guard.tsx
 * @description Route guard ensuring tenant and authenticated user session exist before mounting views.
 * @module apps/console/components/layout
 */

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, clearSession } from "@/lib/auth";

export interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client authentication and tenancy guard.
 * If user session or tenant is absent, gracefully clears orphan cookies and redirects to /login.
 */
export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element {
  const { tenantId, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth state resolved and tenant or session is missing, redirect cleanly to /login
    if (!isLoading && (!isAuthenticated || !tenantId)) {
      clearSession();
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, tenantId, router]);

  // While authenticating or redirecting, render placeholder to prevent unauthenticated crashes
  if (isLoading || !isAuthenticated || !tenantId) {
    return (
      <div className="bg-background flex h-dvh w-screen items-center justify-center">
        <div className="border-primary/20 border-t-primary size-6 animate-spin rounded-full border-2" />
      </div>
    );
  }

  return <>{children}</>;
}
