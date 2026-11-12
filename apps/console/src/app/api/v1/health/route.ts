/**
 * @file apps/console/src/app/api/v1/health/route.ts
 * @description Health probe route handler for OrchestrAI Console Web frontend.
 * @module @orchestrai/console/api/v1/health
 */

import { NextResponse } from "next/server";
import { APP_VERSION, BUILD_METADATA } from "@/lib/constants/version";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "orchestrai-console",
    version: APP_VERSION,
    build: BUILD_METADATA,
    timestamp: new Date().toISOString(),
  });
}
