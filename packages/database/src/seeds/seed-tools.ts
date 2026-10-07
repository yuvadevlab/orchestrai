/**
 * @file packages/database/src/seeds/seed-tools.ts
 * @description Database seeder for platform tools catalog.
 * Uses ToolPermissionLevel enum and zero-overwrite idempotent upsert.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient } from "@prisma/client";
import { ToolPermissionLevel, PlatformToolName, ToolSandboxType } from "@orchestrai/shared-types";

export const SEED_TOOLS = [
  {
    toolId: "6d0e35de-66f2-478b-8d91-8d4559aabb00",
    name: "Python Sandbox",
    slug: PlatformToolName.PYTHON_SANDBOX,
    category: "Computation & APIs",
    description: "Isolated Python script execution and evaluation",
    permissionLevel: ToolPermissionLevel.WRITE_SAFE,
    sandbox: ToolSandboxType.READ_ONLY,
    isEnabled: true,
    sortOrder: 6,
  },
  {
    toolId: "518da4b5-588c-4497-a089-68a8477c6cc2",
    name: "Live Web Search",
    slug: PlatformToolName.WEB_SEARCH,
    category: "Web & Search",
    description: "Query the open web and rank sources by relevance.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    sandbox: ToolSandboxType.NETWORK_READ,
    isEnabled: true,
    sortOrder: 0,
  },
  {
    toolId: "adbbec6e-ee43-4d75-a7a6-a1cb284aca75",
    name: "Document Reader",
    slug: PlatformToolName.DOCUMENT_READER,
    category: "Web & Search",
    description: "Ingest PDFs, DOCX and slides into agent context.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    sandbox: ToolSandboxType.READ_ONLY,
    isEnabled: true,
    sortOrder: 1,
  },
  {
    toolId: "6d35d4da-4ea6-4d79-a9e4-27b4d20547f9",
    name: "URL Scraper",
    slug: PlatformToolName.URL_SCRAPER,
    category: "Web & Search",
    description: "Fetch and clean any public page into markdown.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    sandbox: ToolSandboxType.NETWORK_READ,
    isEnabled: true,
    sortOrder: 2,
  },
  {
    toolId: "b5624755-de25-492d-a308-d4ef665fc2f4",
    name: "Sandbox Terminal",
    slug: PlatformToolName.BASH,
    category: "Computation & APIs",
    description: "Isolated shell for builds, tests and scripts.",
    permissionLevel: ToolPermissionLevel.DANGEROUS,
    sandbox: ToolSandboxType.EPHEMERAL_VM,
    isEnabled: true,
    sortOrder: 6,
  },
  {
    toolId: "b83acacb-0fbc-420f-abaa-7a6e04f7eac0",
    name: "REST API Caller",
    slug: PlatformToolName.REST_API_CALLER,
    category: "Computation & APIs",
    description: "Authenticated calls to any HTTP endpoint.",
    permissionLevel: ToolPermissionLevel.SENSITIVE,
    sandbox: ToolSandboxType.NETWORK_WRITE,
    isEnabled: true,
    sortOrder: 7,
  },
  {
    toolId: "a96479b7-5ab1-48cc-ab08-7d70f1098297",
    name: "CSV / SQL Runner",
    slug: PlatformToolName.SQL_ANALYTICS,
    category: "Documents & Data",
    description: "Run queries against connected datasets.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    sandbox: ToolSandboxType.READ_ONLY,
    isEnabled: true,
    sortOrder: 5,
  },
  {
    toolId: "0272898d-05d4-4366-9a89-a212a98e5985",
    name: "Webhooks",
    slug: PlatformToolName.WEBHOOKS,
    category: "Computation & APIs",
    description: "Emit events into Slack, Linear or custom sinks.",
    permissionLevel: ToolPermissionLevel.SENSITIVE,
    sandbox: ToolSandboxType.NETWORK_WRITE,
    isEnabled: true,
    sortOrder: 8,
  },
  {
    toolId: "3878da35-1616-4173-ad92-98c5263228c2",
    name: "List Directory",
    slug: PlatformToolName.LIST_DIR,
    category: "Filesystem",
    description: "Inspect directory structures and files across workspace",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    sandbox: ToolSandboxType.READ_ONLY,
    isEnabled: true,
    sortOrder: 3,
  },
  {
    toolId: "c0627399-c194-4ae6-a445-57904cdafd25",
    name: "File Writer",
    slug: PlatformToolName.WRITE_FILE,
    category: "Documents & Data",
    description: "Create and edit workspace documents and repos.",
    permissionLevel: ToolPermissionLevel.WRITE_SAFE,
    sandbox: ToolSandboxType.WORKSPACE_WRITE,
    isEnabled: true,
    sortOrder: 3,
  },
  {
    toolId: "e3b00212-4e26-4b3e-bc1a-24a276ca1617",
    name: "PDF Parser",
    slug: PlatformToolName.PDF_PARSER,
    category: "Documents & Data",
    description: "Extract tables and text from complex PDFs.",
    permissionLevel: ToolPermissionLevel.READ_ONLY,
    sandbox: ToolSandboxType.READ_ONLY,
    isEnabled: true,
    sortOrder: 4,
  },
];

/**
 * Seeds platform tools idempotently into PostgreSQL.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedTools(prisma: PrismaClient): Promise<void> {
  for (const tool of SEED_TOOLS) {
    await prisma.platformTool.upsert({
      where: { toolId: tool.toolId },
      update: {}, // Preserve existing data
      create: tool,
    });
  }
}
