/**
 * @file apps/console/src/app/(auth)/layout.tsx
 * @description Immersive AI Neural World layout for authentication flows with dynamic glow matrix.
 * @module apps/console/app/auth
 */

import React from "react";
import { AiWorldBackground } from "@/features/auth/components/ai-world-background";

/**
 * Authentication layout providing an ethereal AI world ambiance, centered stage,
 * and responsive backdrop blur.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="orch-auth-container">
      {/* 1. Dynamic AI Neural Synapse Canvas & Aurora World Background */}
      <AiWorldBackground />

      {/* 2. Authentication Stage Content Perfectly Centered */}
      <main className="orch-auth-stage">{children}</main>
    </div>
  );
}
