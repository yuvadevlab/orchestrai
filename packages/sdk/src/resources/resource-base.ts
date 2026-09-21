/**
 * @file packages/sdk/src/resources/resource-base.ts
 * @description Abstract base class providing uniform HTTP client access for domain sub-resources.
 */

import type { HttpClient } from "@/transport";
import type { OrchestrAIClientOptions } from "@/types";

/**
 * Base resource class providing shared transport and configuration access.
 */
export abstract class ResourceBase {
  constructor(
    protected readonly http: HttpClient,
    protected readonly options: OrchestrAIClientOptions,
  ) {}
}
