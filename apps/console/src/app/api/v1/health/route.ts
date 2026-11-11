/**
 * @file apps/console/src/app/api/v1/health/route.ts
 * @description Health probe route handler for OrchestrAI Console Web frontend.
 * @module @orchestrai/console/api/v1/health
 */

import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "orchestrai-console",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
