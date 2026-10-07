/**
 * @file apps/gateway/src/modules/streaming/live-message-history.ts
 * @description Helper for reconstructing multi-turn conversational message history for agent executions.
 *
 * ─── Package Wiring & Rule Adoption ─────────────────────────────────────────
 * @orchestrai/prompts
 *   - AUTONOMOUS_TOOLS_SYSTEM_PROMPT → Canonical tool-calling instructions
 *   - SPECIALIST_PERSONA_REGISTRY → Agent persona resolved from DB role field
 *   - CORE_PLATFORM_RULES_PROMPT → Automatically adopted platform invariants
 *   - SAFETY_GUARDRAILS_SYSTEM_PROMPT → Automatically adopted safety rules
 *   - MODE_PROMPT_REGISTRY → Dynamic instructions matching picked AgentMode
 *
 * All prompt templates and invariants originate from @orchestrai/prompts — the single source of truth.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * @module apps/gateway/modules/streaming
 */

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MessageRole, AgentMode } from "@orchestrai/shared-types";
import {
  AUTONOMOUS_TOOLS_SYSTEM_PROMPT,
  SPECIALIST_PERSONA_REGISTRY,
  CORE_PLATFORM_RULES_PROMPT,
  SAFETY_GUARDRAILS_SYSTEM_PROMPT,
  MODE_PROMPT_REGISTRY,
  AUTO_MODE_SYSTEM_PROMPT,
} from "@orchestrai/prompts";
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
 *  2. Automatically adopted platform rules and safety invariants from @orchestrai/prompts
 *  3. Dynamic operating mode strategy instructions (CHAT, PLAN, ACT, AUTO)
 *  4. Canonical autonomous tool calling instructions (omitted in CHAT mode)
 *  5. Optional caller-supplied override instructions
 *  6. Live workspace context (repo name + sibling directories)
 *
 * @param personaRole - Agent persona key from DB (e.g. "developer", "researcher"). Defaults to "orchestrator".
 * @param systemPromptOverride - Optional caller-supplied override appended after base prompt
 * @param activeMode - Picked or configured operational AgentMode. Defaults to AUTO.
 * @returns Fully assembled composite system prompt string
 */
export function buildCompositeSystemPrompt(
  personaRole?: string,
  systemPromptOverride?: string,
  activeMode?: AgentMode,
): string {
  const fallbackPersona = SPECIALIST_PERSONA_REGISTRY.orchestrator ?? "";
  const persona: string = personaRole
    ? (SPECIALIST_PERSONA_REGISTRY[personaRole.toLowerCase()] ?? fallbackPersona)
    : fallbackPersona;

  const mode = activeMode ?? AgentMode.AUTO;
  const modeInstruction = MODE_PROMPT_REGISTRY[mode] ?? AUTO_MODE_SYSTEM_PROMPT;

  // In CHAT mode, omit tool-calling definitions to keep output focused on dialogue
  const toolInstructions = mode === AgentMode.CHAT ? [] : [AUTONOMOUS_TOOLS_SYSTEM_PROMPT];

  const parts: string[] = [
    // 1. Specialist persona block
    persona,
    // 2. Automatically adopted core platform rules
    CORE_PLATFORM_RULES_PROMPT,
    // 3. Automatically adopted safety guardrails
    SAFETY_GUARDRAILS_SYSTEM_PROMPT,
    // 4. Operational mode instructions
    modeInstruction,
    // 5. Canonical autonomous tool calling schema (ACT / PLAN / AUTO)
    ...toolInstructions,
    // 6. Optional caller override
    ...(systemPromptOverride ? [systemPromptOverride] : []),
    // 7. Live workspace environment context
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
 * @param activeMode - Operational AgentMode picked for this execution
 * @returns Ordered array of LiveMessage items ready for LLM consumption
 */
export function buildInitialConversationHistory(
  inputPrompt: string,
  personaRole?: string,
  systemPromptOverride?: string,
  history?: Array<{ role: string; content: string }>,
  activeMode?: AgentMode,
): LiveMessage[] {
  // Build composite system prompt with automatic rule and mode adoption
  const compositeSystemPrompt = buildCompositeSystemPrompt(
    personaRole,
    systemPromptOverride,
    activeMode,
  );

  const messages: LiveMessage[] = [
    {
      id: randomUUID(),
      role: MessageRole.SYSTEM,
      content: compositeSystemPrompt,
      metadata: {
        persona: personaRole ?? "orchestrator",
        mode: activeMode ?? AgentMode.AUTO,
      },
      createdAt: new Date(),
    },
  ];

  if (Array.isArray(history)) {
    for (const h of history) {
      if (!h.content) continue;
      // Normalize to lowercase to match canonical enum values
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
