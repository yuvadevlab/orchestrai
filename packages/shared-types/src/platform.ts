/**
 * @file packages/shared-types/src/platform.ts
 * @description Universal entity and DTO types for LLM providers, models, execution modes, and navigation.
 * @module @orchestrai/shared-types
 */

/**
 * Universal LLM Provider entity representation.
 */
export interface LlmProviderRecord {
  readonly providerId: string;
  readonly name: string;
  readonly slug: string;
  readonly providerType: string;
  readonly description?: string;
  readonly baseUrl?: string;
  readonly config?: Record<string, unknown>;
  readonly isEnabled: boolean;
  readonly sortOrder: number;
  readonly modelCount?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Universal LLM Model entity representation.
 */
export interface LlmModelRecord {
  readonly modelId: string;
  readonly providerId: string;
  readonly name: string;
  readonly modelIdentifier: string;
  readonly description?: string;
  readonly capabilities?: Record<string, unknown>;
  readonly defaultConfig?: Record<string, unknown>;
  readonly contextWindow?: number;
  readonly isDefault: boolean;
  readonly isEnabled: boolean;
  readonly sortOrder: number;
  readonly provider?: LlmProviderRecord;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Universal Platform Execution Mode representation.
 */
export interface PlatformModeRecord {
  readonly modeId: string;
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly isDefault: boolean;
  readonly isEnabled: boolean;
  readonly enforceApproval: boolean;
  readonly config?: Record<string, unknown>;
  readonly sortOrder: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Universal Platform Dynamic Navigation Item representation.
 */
export interface NavItemRecord {
  readonly navItemId: string;
  readonly label: string;
  readonly icon?: string;
  readonly href: string;
  readonly roles: readonly string[];
  readonly section: string;
  readonly isVisible: boolean;
  readonly isEnabled: boolean;
  readonly sortOrder: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
