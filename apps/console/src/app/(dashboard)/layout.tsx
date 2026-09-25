import React from "react";
import { ProductNav } from "@/components/layout/product-nav";
import { AuthGuard } from "@/components/layout/auth-guard";

/**
 * Master layout for the OrchestrAI Console.
 * Mounts the high-density vertical navigation rail and active viewport protected by AuthGuard.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <AuthGuard>
      <div className="bg-background text-foreground h-dvh overflow-hidden">
        <div className="mesh-bg flex h-full">
          <ProductNav />
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
