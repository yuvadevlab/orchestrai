/**
 * @file packages/database/src/seed-capabilities.ts
 * @description Default platform capabilities and tool associations seeder.
 * @module @orchestrai/database
 */

import { getPrismaClient, type PrismaClient } from "./client";

/**
 * Capability seed blueprint definition.
 */
export interface DefaultCapabilityBlueprint {
  slug: string;
  name: string;
  description: string;
  category: string;
  tools: string[];
}

/**
 * Foundational platform capabilities available to system-wide agents.
 */
export const DEFAULT_PLATFORM_CAPABILITIES: readonly DefaultCapabilityBlueprint[] = [
  {
    slug: "filesystem_access",
    name: "Filesystem Access",
    description: "Read, write, edit, and search files across authorized filesystem directories",
    category: "System",
    tools: ["read_file", "write_file", "list_directory", "search_files", "edit_file"],
  },
  {
    slug: "repository_management",
    name: "Repository & Workspace Management",
    description: "Inspect git status, branches, commits, and multi-workspace repo topologies",
    category: "Development",
    tools: ["git_status", "git_commit", "search_repo", "create_repo"],
  },
  {
    slug: "system_execution",
    name: "Command Line & Shell Execution",
    description: "Execute shell commands, process automation, and build tasks within sandboxes",
    category: "System",
    tools: ["bash"],
  },
  {
    slug: "database_access",
    name: "Database Querying & Inspection",
    description: "Query databases, inspect schemas, and validate data migrations",
    category: "Data",
    tools: ["query_database", "inspect_schema"],
  },
  {
    slug: "api_integration",
    name: "External API & Web Integration",
    description: "Perform authorized HTTP requests, API calls, and webhook invocations",
    category: "Network",
    tools: ["call_api", "fetch_url"],
  },
  {
    slug: "memory_and_rag",
    name: "Long-Term Memory & RAG Retrieval",
    description: "Record episodic facts, recall past sessions, and query vector knowledge bases",
    category: "Intelligence",
    tools: ["record_memory", "recall_memory", "search_rag"],
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
