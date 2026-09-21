/**
 * @file subagent-coordinator.ts
 * @description Hierarchical sub-agent coordinator dispatching parallel tasks and merging execution state.
 * @module @orchestrai/runtime/multi-agent
 */

import { AgentRouter, type AgentMessage } from "./agent-router";

/** Sub-agent execution result payload */
export interface SubagentTaskResult {
  readonly subagentId: string;
  readonly status: "COMPLETED" | "FAILED";
  readonly outputText: string;
  readonly durationMs: number;
}

/**
 * Coordinator managing hierarchical multi-agent delegations.
 */
export class SubagentCoordinator {
  constructor(private readonly router: AgentRouter = new AgentRouter()) {}

  /**
   * Dispatches sub-agent tasks concurrently and gathers task results.
   *
   * @param supervisorId - ID of requesting supervisor agent.
   * @param tasks - Array of subagent delegation tasks.
   * @param runner - Factory function executing subagent task run.
   * @returns Array of completed SubagentTaskResult items.
   */
  public async dispatchParallelSubagents(
    supervisorId: string,
    tasks: readonly { subagentId: string; taskPrompt: string }[],
    runner: (prompt: string) => Promise<string>,
  ): Promise<SubagentTaskResult[]> {
    const promises = tasks.map(async (task) => {
      const startTime = Date.now();
      const message: AgentMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        senderAgentId: supervisorId,
        targetAgentId: task.subagentId,
        taskPrompt: task.taskPrompt,
        contextVariables: {},
        timestamp: new Date().toISOString(),
      };

      this.router.routeMessage(message);

      try {
        const outputText = await runner(task.taskPrompt);
        return {
          subagentId: task.subagentId,
          status: "COMPLETED" as const,
          outputText,
          durationMs: Date.now() - startTime,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
          subagentId: task.subagentId,
          status: "FAILED" as const,
          outputText: `Subagent execution error: ${errorMsg}`,
          durationMs: Date.now() - startTime,
        };
      }
    });

    return Promise.all(promises);
  }
}
