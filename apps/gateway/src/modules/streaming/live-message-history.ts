/**
 * @file apps/gateway/src/modules/streaming/live-message-history.ts
 * @description Helper for reconstructing multi-turn conversational message history for agent executions.
 *
 * ─── Package Wiring (Phase 1) ───────────────────────────────────────────────
 * @orchestrai/prompts
 *   - AUTONOMOUS_TOOLS_SYSTEM_PROMPT → replaces the inline system prompt string
 *     that was duplicated in autonomous-agent-runner.ts
 *   - SPECIALIST_PERSONA_REGISTRY → agent persona resolved from DB role field
 *     and prepended to the base system instructions
 *
 * This file previously called buildAutonomousSystemPrompt() from autonomous-agent-runner.ts
 * which itself contained the inline AUTONOMOUS_TOOLS_SYSTEM_PROMPT string literal.
 * Now all prompt templates originate from @orchestrai/prompts — the single source of truth.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * @module apps/gateway/modules/streaming
 */

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MessageRole } from "@orchestrai/shared-types";
import { AUTONOMOUS_TOOLS_SYSTEM_PROMPT, SPECIALIST_PERSONA_REGISTRY } from "@orchestrai/prompts";
import { resolveMonorepoRoot } from "@/modules/streaming/autonomous-agent-runner";

export interface LiveMessage {
  id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Discovers the active workspace name and sibling repository projects in the parent directory.
 * Injected as a USER-facing context block so the agent understands its file system environment.
 */
function getWorkspaceContext(): string {
  const root = resolveMonorepoRoot();
  const repoName = path.basename(root);
  const parentDir = path.dirname(root);
  let siblingDirs: string[] = [];

  try {
    siblingDirs = fs
      .readdirSync(parentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== repoName)
      .map((d) => d.name);
  } catch {
    // Filesystem restriction — fail silently and proceed with empty siblings list
  }

  const siblingsText = siblingDirs.length > 0 ? siblingDirs.join(", ") : "none detected";
  return `
Current Environment & Workspace Context:
- Active Workspace: "${repoName}" (${root})
- Sibling Repositories in "${parentDir}": ${siblingsText}
- When the user asks to access or inspect another repository (e.g. "finai"), DO NOT read files from the current "${repoName}" workspace! You MUST specify the external path: "../<repo-name>/<file>" or "<repo-name>/<file>".
- Accessing external projects outside "${repoName}" will automatically request interactive human operator clearance.
- NEVER claim that files in the current "${repoName}" workspace belong to another repository.
`.trim();
}

/**
 * Builds the composite system prompt for an execution by combining:
 *  1. Specialist persona from @orchestrai/prompts (developer, researcher, architect, orchestrator)
 *  2. Base autonomous tools system prompt from @orchestrai/prompts
 *  3. Optional caller-supplied override instructions
 *  4. Live workspace context (repo name + sibling directories)
 *
 * @param personaRole - Agent persona key from DB (e.g. "developer", "researcher"). Defaults to "orchestrator".
 * @param systemPromptOverride - Optional caller-supplied override appended after base prompt
 * @returns Fully assembled system prompt string
 */
export function buildCompositeSystemPrompt(
  personaRole?: string,
  systemPromptOverride?: string,
): string {
  const fallbackPersona = SPECIALIST_PERSONA_REGISTRY.orchestrator ?? "";
  const persona: string = personaRole
    ? (SPECIALIST_PERSONA_REGISTRY[personaRole.toLowerCase()] ?? fallbackPersona)
    : fallbackPersona;

  const parts: string[] = [
    // 1. Specialist persona block (developer, researcher, etc.)
    persona,
    // 2. Canonical autonomous tool instructions from @orchestrai/prompts
    AUTONOMOUS_TOOLS_SYSTEM_PROMPT,
    // 3. Optional caller override (e.g. agent's custom instructions from DB)
    ...(systemPromptOverride ? [systemPromptOverride] : []),
    // 4. Live workspace environment context
    getWorkspaceContext(),
  ];

  return parts.join("\n\n");
}

/**
 * Reconstructs initial conversation message history including system prompt and prior turns.
 *
 * @param inputPrompt - Latest user instruction
 * @param personaRole - Agent persona key (e.g. "developer", "researcher")
 * @param systemPromptOverride - Optional specialist system prompt override from DB agent record
 * @param history - Array of previous chat message turns from the session
 * @returns Ordered array of LiveMessage items ready for LLM consumption
 */
export function buildInitialConversationHistory(
  inputPrompt: string,
  personaRole?: string,
  systemPromptOverride?: string,
  history?: Array<{ role: string; content: string }>,
): LiveMessage[] {
  // Build composite system prompt using @orchestrai/prompts as the canonical source
  const compositeSystemPrompt = buildCompositeSystemPrompt(personaRole, systemPromptOverride);

  const messages: LiveMessage[] = [
    {
      id: randomUUID(),
      role: MessageRole.SYSTEM,
      content: compositeSystemPrompt,
      metadata: { persona: personaRole ?? "orchestrator" },
      createdAt: new Date(),
    },
  ];

  // Inject prior conversation turns from the session (full linear history for now)
  // TODO Phase 2: Replace with Conversational RAG (retrieveRelevantHistory) from packages/memory
  if (Array.isArray(history)) {
    for (const h of history) {
      if (!h.content) continue;
      // Normalize to lowercase to match enum string values; map "assistant"/"agent" to ASSISTANT
      const role =
        h.role.toLowerCase() === MessageRole.USER ? MessageRole.USER : MessageRole.ASSISTANT;
      messages.push({
        id: randomUUID(),
        role,
        content: h.content,
        metadata: {},
        createdAt: new Date(),
      });
    }
  }

  messages.push({
    id: randomUUID(),
    role: MessageRole.USER,
    content: inputPrompt,
    metadata: {},
    createdAt: new Date(),
  });

  return messages;
}
