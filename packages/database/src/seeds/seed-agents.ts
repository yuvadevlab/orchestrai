/**
 * @file packages/database/src/seeds/seed-agents.ts
 * @description Idempotent seeder for default workspace tenant and specialist agents.
 * Preserves existing database data with zero deletion or truncation.
 * Uses canonical enums for mode and scope.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient, Prisma } from "@prisma/client";
import {
  AgentMode,
  PlatformScope,
  AgentRoleSlug,
  PlatformToolName,
} from "@orchestrai/shared-types";

export const DEFAULT_TENANT_ID = "e84e82d6-5e8f-4ba4-a242-86747fe88107";
const DEFAULT_SEED_MODEL = process.env.DEFAULT_MODEL_NAME || process.env.OLLAMA_DEFAULT_MODEL || "";

export const SEED_AGENTS = [
  {
    agentId: "dd9581a7-e03c-47ed-98e8-31e740890dbd",
    tenantId: DEFAULT_TENANT_ID,
    name: "Lead Orchestrator",
    description: "Interprets goals, synthesizes plans, and delegates to domain specialists.",
    mode: AgentMode.AUTO,
    systemPrompt:
      "You are the Lead Orchestrator for OrchestrAI. Analyze user intents, break down complex goals into execution plans, and coordinate specialized agent swarms to accomplish objectives efficiently.",
    modelConfig: { model: DEFAULT_SEED_MODEL },
    enabledTools: [
      PlatformToolName.WEB_SEARCH,
      PlatformToolName.DOCUMENT_READER,
      PlatformToolName.LIST_DIR,
    ],
    maxSteps: 30,
    metadata: { role: AgentRoleSlug.STRATEGY },
    scope: PlatformScope.PLATFORM,
  },
  {
    agentId: "a15eb25b-b0f0-430f-ac9e-01921263a38f",
    tenantId: DEFAULT_TENANT_ID,
    name: "Deep Research Specialist",
    description: "Conducts multi-source investigation, fact-checks, and synthesizes evidence.",
    mode: AgentMode.PLAN,
    systemPrompt:
      "You are the Deep Research Specialist. Conduct thorough multi-source investigations across documents and web queries, gather grounded citations, and synthesize comprehensive intelligence briefs.",
    modelConfig: { model: DEFAULT_SEED_MODEL },
    enabledTools: [
      PlatformToolName.WEB_SEARCH,
      PlatformToolName.URL_SCRAPER,
      PlatformToolName.DOCUMENT_READER,
      PlatformToolName.PDF_PARSER,
    ],
    maxSteps: 25,
    metadata: { role: AgentRoleSlug.RESEARCH },
    scope: PlatformScope.PLATFORM,
  },
  {
    agentId: "bba15a06-7560-4d0f-99ce-6b3e6d5220f2",
    tenantId: DEFAULT_TENANT_ID,
    name: "Strategic Document Author",
    description: "Drafts crystal-clear technical specifications, memos, and publications.",
    mode: AgentMode.ACT,
    systemPrompt:
      "You are the Strategic Document Author. Draft publication-ready PRDs, technical specifications, executive summaries, and architectural design documents with precision and clear structure.",
    modelConfig: { model: DEFAULT_SEED_MODEL },
    enabledTools: [PlatformToolName.DOCUMENT_READER, PlatformToolName.WRITE_FILE],
    maxSteps: 25,
    metadata: { role: AgentRoleSlug.WRITING },
    scope: PlatformScope.PLATFORM,
  },
  {
    agentId: "c26df648-ff0e-481d-9c56-2e1237f0811d",
    tenantId: DEFAULT_TENANT_ID,
    name: "Fullstack Systems Architect",
    description: "Designs system architectures, implements robust code, and executes tools.",
    mode: AgentMode.ACT,
    systemPrompt:
      "You are the Fullstack Systems Architect. Design clean modular system architectures, author maintainable code, execute sandboxed terminal commands, and inspect project repositories.",
    modelConfig: { model: DEFAULT_SEED_MODEL },
    enabledTools: [
      PlatformToolName.WRITE_FILE,
      PlatformToolName.LIST_DIR,
      PlatformToolName.BASH,
      PlatformToolName.PYTHON_SANDBOX,
    ],
    maxSteps: 35,
    metadata: { role: AgentRoleSlug.ENGINEERING },
    scope: PlatformScope.PLATFORM,
  },
  {
    agentId: "b2e2fce7-0ce1-47a6-973f-c18e49ca9d91",
    tenantId: DEFAULT_TENANT_ID,
    name: "Data & Insights Analyst",
    description: "Analyzes datasets, crafts SQL pipelines, and generates actionable metrics.",
    mode: AgentMode.AUTO,
    systemPrompt:
      "You are the Data & Insights Analyst. Interrogate structured data, execute SQL queries against connected databases, extract statistical insights, and generate analytical summaries.",
    modelConfig: { model: DEFAULT_SEED_MODEL },
    enabledTools: [
      PlatformToolName.SQL_ANALYTICS,
      PlatformToolName.PYTHON_SANDBOX,
      PlatformToolName.DOCUMENT_READER,
    ],
    maxSteps: 25,
    metadata: { role: AgentRoleSlug.DATA },
    scope: PlatformScope.PLATFORM,
  },
  {
    agentId: "bec106a6-0b7e-4c15-b439-9b25cdbd26a1",
    tenantId: DEFAULT_TENANT_ID,
    name: "Workflow Automator",
    description: "Background task scheduling, webhook handling, and repetitive chaining.",
    mode: AgentMode.AUTO,
    systemPrompt:
      "You are the Workflow Automator. Build resilient automation sequences, integrate with external APIs and webhooks, and ensure reliable execution flow.",
    modelConfig: { model: DEFAULT_SEED_MODEL },
    enabledTools: [
      PlatformToolName.REST_API_CALLER,
      PlatformToolName.WEBHOOKS,
      PlatformToolName.BASH,
    ],
    maxSteps: 25,
    metadata: { role: AgentRoleSlug.AUTOMATION },
    scope: PlatformScope.PLATFORM,
  },
];

/**
 * Seeds default tenant and specialist agents if not already present.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedAgents(prisma: PrismaClient): Promise<void> {
  // 1. Ensure default tenant exists
  await prisma.tenant.upsert({
    where: { tenantId: DEFAULT_TENANT_ID },
    update: {}, // Preserve existing tenant data
    create: {
      tenantId: DEFAULT_TENANT_ID,
      name: "Default Workspace",
      slug: "default",
    },
  });

  // 2. Seed agents idempotently
  for (const agent of SEED_AGENTS) {
    await prisma.agent.upsert({
      where: { agentId: agent.agentId },
      update: {}, // Preserve existing agent modifications
      create: {
        agentId: agent.agentId,
        tenantId: agent.tenantId,
        name: agent.name,
        description: agent.description,
        mode: agent.mode,
        systemPrompt: agent.systemPrompt,
        modelConfig: agent.modelConfig as Prisma.InputJsonValue,
        enabledTools: agent.enabledTools as Prisma.InputJsonValue,
        maxSteps: agent.maxSteps,
        metadata: agent.metadata as Prisma.InputJsonValue,
        scope: agent.scope,
      },
    });
  }
}
