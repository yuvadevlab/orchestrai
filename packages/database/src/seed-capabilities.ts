/**
 * @file packages/database/src/seed-capabilities.ts
 * @description Default platform capabilities and tool associations seeder.
 * @module @orchestrai/database
 */

import { getPrismaClient, type PrismaClient } from "./client";
import { PlatformCapabilitySlug, PlatformToolName } from "@orchestrai/shared-types";

/**
 * Capability seed blueprint definition.
 */
export interface DefaultCapabilityBlueprint {
  slug: PlatformCapabilitySlug;
  name: string;
  description: string;
  category: string;
  tools: PlatformToolName[];
}

/**
 * Foundational platform capabilities available to system-wide agents.
 */
export const DEFAULT_PLATFORM_CAPABILITIES: readonly DefaultCapabilityBlueprint[] = [
  {
    slug: PlatformCapabilitySlug.FILESYSTEM_ACCESS,
    name: "Filesystem Access",
    description: "Read, write, edit, and search files across authorized filesystem directories",
    category: "System",
    tools: [
      PlatformToolName.READ_FILE,
      PlatformToolName.WRITE_FILE,
      PlatformToolName.LIST_DIRECTORY,
      PlatformToolName.SEARCH_FILES,
      PlatformToolName.EDIT_FILE,
    ],
  },
  {
    slug: PlatformCapabilitySlug.REPOSITORY_MANAGEMENT,
    name: "Repository & Workspace Management",
    description: "Inspect git status, branches, commits, and multi-workspace repo topologies",
    category: "Development",
    tools: [
      PlatformToolName.GIT_STATUS,
      PlatformToolName.GIT_COMMIT,
      PlatformToolName.SEARCH_REPO,
      PlatformToolName.CREATE_REPO,
    ],
  },
  {
    slug: PlatformCapabilitySlug.SYSTEM_EXECUTION,
    name: "Command Line & Shell Execution",
    description: "Execute shell commands, process automation, and build tasks within sandboxes",
    category: "System",
    tools: [PlatformToolName.BASH],
  },
  {
    slug: PlatformCapabilitySlug.DATABASE_ACCESS,
    name: "Database Querying & Inspection",
    description: "Query databases, inspect schemas, and validate data migrations",
    category: "Data",
    tools: [PlatformToolName.QUERY_DATABASE, PlatformToolName.INSPECT_SCHEMA],
  },
  {
    slug: PlatformCapabilitySlug.API_INTEGRATION,
    name: "External API & Web Integration",
    description: "Perform authorized HTTP requests, API calls, and webhook invocations",
    category: "Network",
    tools: [PlatformToolName.CALL_API, PlatformToolName.FETCH_URL],
  },
  {
    slug: PlatformCapabilitySlug.MEMORY_AND_RAG,
    name: "Long-Term Memory & RAG Retrieval",
    description: "Record episodic facts, recall past sessions, and query vector knowledge bases",
    category: "Intelligence",
    tools: [
      PlatformToolName.RECORD_MEMORY,
      PlatformToolName.RECALL_MEMORY,
      PlatformToolName.SEARCH_RAG,
    ],
  },
];

/**
 * Seeds or synchronizes default platform capabilities and tool bindings.
 * Idempotent: existing capabilities are updated while preserving custom configuration.
 *
 * @param client - Optional PrismaClient instance
 */
export async function seedDefaultCapabilities(client?: PrismaClient): Promise<void> {
  const prisma = client ?? getPrismaClient();

  for (const item of DEFAULT_PLATFORM_CAPABILITIES) {
    // 1. Upsert capability record
    const capability = await prisma.capability.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        category: item.category,
      },
    });

    // 2. Link each tool slug if registered in platform_tools
    for (const toolSlug of item.tools) {
      const tool = await prisma.platformTool.findUnique({
        where: { slug: toolSlug },
      });

      if (tool) {
        await prisma.capabilityTool.upsert({
          where: {
            capabilityId_toolId: {
              capabilityId: capability.capabilityId,
              toolId: tool.toolId,
            },
          },
          update: {},
          create: {
            capabilityId: capability.capabilityId,
            toolId: tool.toolId,
          },
        });
      }
    }
  }
}
