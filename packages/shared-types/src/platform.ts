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

/**
 * Budget allocation and quota usage metrics for a tenant partition.
 */
export interface TenantBudgetInfo {
  readonly tenantId: string;
  readonly maxMonthlySpendUsd: number;
  readonly currentSpendUsd: number;
  readonly totalTokensUsed: number;
  readonly periodStart: string;
  readonly isThrottled: boolean;
}

/**
 * Universal Tenant metadata entity representation.
 */
export interface TenantRecord {
  readonly tenantId: string;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Universal Platform Slash Command entity representation.
 */
export interface PlatformCommandRecord {
  readonly commandId: string;
  readonly command: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly targetMode?: string;
  readonly action?: string;
  readonly isEnabled: boolean;
  readonly sortOrder: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Canonical configuration namespaces for dynamic server-driven parameters.
 */
export enum ConfigNamespace {
  COMMANDS = "commands",
  SUGGESTIONS = "suggestions",
  EXECUTION = "execution",
  CACHE = "cache",
  COMPACTION = "compaction",
  RAG = "rag",
  BRANDING = "branding",
  TOOLS = "tools",
}

/**
 * Canonical configuration keys for dynamic parameters.
 */
export enum ConfigKey {
  SLASH_COMMANDS = "slash_commands",
  WELCOME_CHIPS = "welcome_chips",
  WELCOME_HEADLINE = "welcome_headline",
  WELCOME_SUBTITLE = "welcome_subtitle",
  EXECUTION_DEFAULTS = "execution_defaults",
  SEMANTIC_CACHE = "semantic_cache",
  COMPACTION_THRESHOLD = "compaction_threshold",
  RAG_CHUNKING = "rag_chunking",
  BRAND_NAME = "brand_name",
  BRAND_VERSION = "brand_version",
  CATEGORY_BLURBS = "category_blurbs",
}

/**
 * Canonical feature flag and kill switch keys.
 */
export enum FeatureFlagKey {
  KILL_SWITCH_BASH_TOOL = "kill_switch_bash_tool",
  ENABLE_EXTENDED_THINKING = "enable_extended_thinking",
  KILL_SWITCH_CRAWLER = "kill_switch_crawler",
  MAINTENANCE_MODE = "maintenance_mode",
}

/**
 * Canonical cognitive policy slugs.
 */
export enum CognitivePolicySlug {
  DEEP_REASONING = "deep_reasoning",
  AUTONOMOUS_ACT = "autonomous_act",
  FAST_CHAT = "fast_chat",
}

/**
 * Canonical system prompt template slugs.
 */
export enum SystemPromptSlug {
  MODE_PLAN = "mode_plan",
  MODE_ACT = "mode_act",
  MODE_CHAT = "mode_chat",
  PLATFORM_RULES = "platform_rules",
}
