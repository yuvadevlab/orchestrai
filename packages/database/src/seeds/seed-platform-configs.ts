/**
 * @file packages/database/src/seeds/seed-platform-configs.ts
 * @description Database seeder for namespaced platform configurations (commands, suggestions, execution, cache, compaction, RAG).
 * Fully dynamic server-driven operational parameter store adhering to Big 3 standards.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient, Prisma } from "@prisma/client";
import { ConfigNamespace, ConfigKey } from "@orchestrai/shared-types";

export interface PlatformConfigBlueprint {
  namespace: ConfigNamespace;
  key: ConfigKey;
  value: unknown;
  description: string;
}

export const SEED_PLATFORM_CONFIGS: readonly PlatformConfigBlueprint[] = [
  {
    namespace: ConfigNamespace.COMMANDS,
    key: ConfigKey.SLASH_COMMANDS,
    description: "Available studio slash commands with mode bindings and actions",
    value: [
      {
        commandId: "cmd-plan",
        command: "/plan",
        title: "Plan Mode",
        description: "Decompose complex task into interactive checklist before acting",
        icon: "CheckSquare",
        targetMode: "plan",
        isEnabled: true,
        sortOrder: 1,
      },
      {
        commandId: "cmd-act",
        command: "/act",
        title: "Act Mode",
        description: "Autonomous tool execution with filesystem and shell access",
        icon: "Terminal",
        targetMode: "act",
        isEnabled: true,
        sortOrder: 2,
      },
      {
        commandId: "cmd-chat",
        command: "/chat",
        title: "Chat Mode",
        description: "Conversational brainstorming and reasoning without tools",
        icon: "MessageSquare",
        targetMode: "chat",
        isEnabled: true,
        sortOrder: 3,
      },
      {
        commandId: "cmd-auto",
        command: "/auto",
        title: "Auto Mode",
        description: "Autonomous heuristic intent routing per execution turn",
        icon: "Sparkles",
        targetMode: "auto",
        isEnabled: true,
        sortOrder: 4,
      },
      {
        commandId: "cmd-clear",
        command: "/clear",
        title: "Clear Thread",
        description: "Clear active conversation messages and reset canvas",
        icon: "Trash2",
        action: "clear",
        isEnabled: true,
        sortOrder: 5,
      },
      {
        commandId: "cmd-compact",
        command: "/compact",
        title: "Compact Context",
        description: "Summarize earlier message history to conserve context window",
        icon: "Minimize2",
        action: "compact",
        isEnabled: true,
        sortOrder: 6,
      },
      {
        commandId: "cmd-files",
        command: "/files",
        title: "List Files",
        description: "Inspect project files in current workspace directory",
        icon: "Folder",
        action: "files",
        isEnabled: true,
        sortOrder: 7,
      },
      {
        commandId: "cmd-help",
        command: "/help",
        title: "Help & Shortcuts",
        description: "View available slash commands, keyboard shortcuts and cheat sheet",
        icon: "HelpCircle",
        action: "help",
        isEnabled: true,
        sortOrder: 8,
      },
    ],
  },
  {
    namespace: ConfigNamespace.SUGGESTIONS,
    key: ConfigKey.WELCOME_CHIPS,
    description: "Welcome screen starter prompts",
    value: [
      "Analyze market competitors",
      "Draft product requirements",
      "Automate data pipeline",
      "Review this codebase",
      "Build a 90-day roadmap",
    ],
  },
  {
    namespace: ConfigNamespace.EXECUTION,
    key: ConfigKey.EXECUTION_DEFAULTS,
    description: "Platform-wide autonomous agent execution hyperparameters and safety bounds",
    value: {
      defaultTemperature: 0.7,
      deterministicTemperature: 0.1,
      factualTemperature: 0.2,
      defaultMaxSteps: 20,
      defaultMaxOutputTokens: 2048,
      defaultContextWindow: 8192,
      defaultTimeoutMs: 30000,
      defaultRateLimitWindowMs: 60000,
      defaultRateLimitMaxRequests: 120,
    },
  },
  {
    namespace: ConfigNamespace.CACHE,
    key: ConfigKey.SEMANTIC_CACHE,
    description: "Semantic vector cache similarity threshold and TTL configuration",
    value: {
      similarityThreshold: 0.97,
      ttlMs: 3600000,
      maxEntries: 1000,
    },
  },
  {
    namespace: ConfigNamespace.COMPACTION,
    key: ConfigKey.COMPACTION_THRESHOLD,
    description: "Context window compaction trigger ratio and minimum token threshold",
    value: {
      thresholdRatio: 0.75,
      minTriggerTokens: 4096,
    },
  },
  {
    namespace: ConfigNamespace.RAG,
    key: ConfigKey.RAG_CHUNKING,
    description: "Text chunker boundary-aware sliding window defaults",
    value: {
      maxTokens: 512,
      overlapTokens: 64,
    },
  },
  {
    namespace: ConfigNamespace.SUGGESTIONS,
    key: ConfigKey.WELCOME_HEADLINE,
    description: "Welcome hero screen main headline",
    value: "What should your agents take on?",
  },
  {
    namespace: ConfigNamespace.SUGGESTIONS,
    key: ConfigKey.WELCOME_SUBTITLE,
    description: "Welcome hero screen tagline blurb",
    value: "One objective. A swarm of specialists. Auditable results.",
  },
  {
    namespace: ConfigNamespace.BRANDING,
    key: ConfigKey.BRAND_NAME,
    description: "Platform application display brand name",
    value: "OrchestrAI",
  },
  {
    namespace: ConfigNamespace.BRANDING,
    key: ConfigKey.BRAND_VERSION,
    description: "Platform application version badge string",
    value: "v0.1.0 • local-first",
  },
  {
    namespace: ConfigNamespace.TOOLS,
    key: ConfigKey.CATEGORY_BLURBS,
    description: "Contextual descriptive blurbs for platform tool domains",
    value: {
      "Web & Search": "Reach the live internet with grounded, cited retrieval.",
      "Documents & Data": "Author artifacts and interrogate structured data.",
      "Computation & APIs": "Execute code and talk to external systems safely.",
      Filesystem: "Inspect and mutate workspace documents and repositories safely.",
    },
  },
];

/**
 * Seeds namespaced platform configurations idempotently into PostgreSQL.
 * Uses update: {} to preserve existing user configurations without data loss.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedPlatformConfigs(prisma: PrismaClient): Promise<void> {
  for (const config of SEED_PLATFORM_CONFIGS) {
    await prisma.platformConfig.upsert({
      where: {
        namespace_key: {
          namespace: config.namespace,
          key: config.key,
        },
      },
      update: {},
      create: {
        namespace: config.namespace,
        key: config.key,
        value: config.value as Prisma.InputJsonValue,
        description: config.description,
      },
    });
  }
}
