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
    <div className="bg-background text-foreground relative flex min-h-screen w-full items-center justify-center overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* 1. Dynamic AI Neural Synapse Canvas & Aurora World Background */}
      <AiWorldBackground />

      {/* 2. Authentication Stage Content Perfectly Centered */}
      <main className="relative z-10 my-auto flex w-full max-w-md items-center justify-center">
        {children}
      </main>
    </div>
  );
}
