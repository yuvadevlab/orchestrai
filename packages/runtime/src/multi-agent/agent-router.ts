/**
 * @file agent-router.ts
 * @description Inter-agent message router enabling peer-to-peer and supervisor-to-subagent communications.
 * @module @orchestrai/runtime/multi-agent
 */

/** Inter-agent task delegation message payload */
export interface AgentMessage {
  readonly id: string;
  readonly senderAgentId: string;
  readonly targetAgentId: string;
  readonly taskPrompt: string;
  readonly contextVariables: Record<string, unknown>;
  readonly timestamp: string;
}

/**
 * In-memory router managing message queues and agent-to-agent task delegation routing.
 */
export class AgentRouter {
  private readonly queues = new Map<string, AgentMessage[]>();

  /**
   * Dispatches a message to a target agent's inbox queue.
   *
   * @param message - AgentMessage payload to route.
   */
  public routeMessage(message: AgentMessage): void {
    const queue = this.queues.get(message.targetAgentId) ?? [];
    queue.push(message);
    this.queues.set(message.targetAgentId, queue);
  }

  /**
   * Dequeues pending messages for a specific target agent.
   *
   * @param agentId - Target agent ID.
   * @returns Array of pending AgentMessage payloads.
   */
  public consumeMessages(agentId: string): AgentMessage[] {
    const pending = this.queues.get(agentId) ?? [];
    this.queues.set(agentId, []);
    return pending;
  }
}
