/**
 * @file apps/gateway/src/services/live-message-history.ts
 * @description Helper for reconstructing multi-turn conversational message history for agent executions.
 * @module apps/gateway/services
 */

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MessageRole } from "@orchestrai/shared-types";
import {
  buildAutonomousSystemPrompt,
  resolveMonorepoRoot,
} from "@/modules/streaming/autonomous-agent-runner";

export interface LiveMessage {
  id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Discovers active workspace name and sibling repository projects in parent directory.
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
    // filesystem restriction fallback
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
 * Reconstructs initial conversation message history including system prompt and prior turns.
 *
 * @param inputPrompt - Latest user instruction
 * @param systemPrompt - Optional specialist system prompt override
 * @param history - Array of previous chat message turns
 * @returns Ordered array of LiveMessage items ready for LLM consumption
 */
export function buildInitialConversationHistory(
  inputPrompt: string,
  systemPrompt?: string,
  history?: Array<{ role: string; content: string }>,
): LiveMessage[] {
  const compositeSystemPrompt = `${buildAutonomousSystemPrompt(systemPrompt)}\n\n${getWorkspaceContext()}`;
  const messages: LiveMessage[] = [
    {
      id: randomUUID(),
      role: MessageRole.SYSTEM,
      content: compositeSystemPrompt,
      metadata: {},
      createdAt: new Date(),
    },
  ];

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
