/**
 * @file packages/agent/src/modes/plan/plan-parser.ts
 * @description Extracts and parses structured Plan objects from model outputs.
 */

import { PlanSchema, PlanStepStatus, PlanOverallStatus, type Plan } from "./plan.schema";

/**
 * Attempts to parse a structured Plan from an LLM response string.
 * Supports:
 * 1. Fenced ```json code blocks containing a Plan object
 * 2. Raw JSON string representing a Plan object
 * 3. XML `<plan>` tags enclosing JSON
 *
 * @param content - Raw text content from the assistant's turn.
 * @param defaultGoal - Fallback goal description if the parsed object lacks one.
 * @returns Parsed and validated Plan object, or null if no valid plan structure found.
 */
export function parsePlanFromResponse(content: string, defaultGoal = "Execute Goal"): Plan | null {
  // Strategy 1: Look for ```json ... ``` code fence
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch?.[1]) {
    const plan = tryParseJsonPlan(jsonMatch[1], defaultGoal);
    // Guard: Return immediately if valid JSON block found
    if (plan) return plan;
  }

  // Strategy 2: Look for `<plan>...</plan>` XML tags
  const xmlMatch = content.match(/<plan>([\s\S]*?)<\/plan>/);
  if (xmlMatch?.[1]) {
    const plan = tryParseJsonPlan(xmlMatch[1], defaultGoal);
    // Guard: Return immediately if valid plan XML block found
    if (plan) return plan;
  }

  // Strategy 3: Try parsing the whole content directly if it starts with {
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const plan = tryParseJsonPlan(trimmed, defaultGoal);
    // Guard: Return if valid root JSON
    if (plan) return plan;
  }

  return null;
}

/**
 * Internal helper to safely deserialize and validate JSON against the PlanSchema.
 */
function tryParseJsonPlan(jsonString: string, defaultGoal: string): Plan | null {
  try {
    const parsed = JSON.parse(jsonString);
    // Auto-fill required metadata fields if omitted by the LLM
    const now = new Date().toISOString();
    const normalized = {
      planId: typeof parsed.planId === "string" ? parsed.planId : `plan-${Date.now()}`,
      goal: typeof parsed.goal === "string" ? parsed.goal : defaultGoal,
      steps: Array.isArray(parsed.steps)
        ? parsed.steps.map((step: Record<string, unknown>, index: number) => ({
            id: typeof step.id === "string" ? step.id : `step-${index + 1}`,
            title: typeof step.title === "string" ? step.title : `Task ${index + 1}`,
            description: typeof step.description === "string" ? step.description : "",
            toolTarget: typeof step.toolTarget === "string" ? step.toolTarget : undefined,
            dependencies: Array.isArray(step.dependencies) ? step.dependencies : [],
            status: typeof step.status === "string" ? step.status : PlanStepStatus.PENDING,
            verificationCriteria:
              typeof step.verificationCriteria === "string" ? step.verificationCriteria : undefined,
          }))
        : [],
      status: typeof parsed.status === "string" ? parsed.status : PlanOverallStatus.DRAFT,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : now,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : now,
    };

    const result = PlanSchema.safeParse(normalized);
    // Guard: Return parsed object on valid schema match
    if (result.success) {
      return result.data;
    }
    return null;
  } catch {
    // Graceful swallow of JSON syntax errors
    return null;
  }
}
