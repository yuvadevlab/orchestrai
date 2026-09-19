/**
 * @fileoverview Core UI domain entities and types for the OrchestrAI Console.
 * Sourced and refined from the high-density lovable agent platform specification.
 */

/**
 * Operational state of an individual orchestrated agent.
 */
export type AgentStatus = "active" | "idle" | "paused" | "error";

/**
 * Comprehensive profile of an autonomous specialist or supervisor agent.
 */
export interface Agent {
  id: string;
  name: string;
  role: string;
  glyph: string;
  status: AgentStatus;
  description: string;
  model: string;
  mode: "autonomous" | "supervised" | "delegated";
  capabilities: string[];
  tools: string[];
  instructions: string;
  stats: {
    executions: number;
    successRate: number;
    avgDuration: string;
    tokens: string;
  };
}

/**
 * Lifecycle execution state for an agent task run.
 */
export type ExecutionStatus = "running" | "completed" | "failed" | "waiting" | "cancelled";

/**
 * Replayable execution session record.
 */
export interface Execution {
  id: string;
  task: string;
  agentId: string;
  agent: string;
  status: ExecutionStatus;
  mode: "autonomous" | "supervised" | "delegated";
  duration: string;
  tools: number;
  tokens: number;
  startedAt: string;
  completedAt: string | null;
  summary: string;
  steps: ExecutionStep[];
  errors: { step: string; message: string; recovered: boolean }[];
}

/**
 * Individual step inside an execution DAG.
 */
export interface ExecutionStep {
  id: string;
  label: string;
  agent: string;
  type:
    | "think"
    | "plan"
    | "search"
    | "web"
    | "file"
    | "database"
    | "delegate"
    | "model"
    | "tool"
    | "approval"
    | "rag"
    | "code";
  duration: string;
  status: "done" | "failed" | "waiting";
  input: string;
  output: string;
}

/**
 * Multi-turn operator-agent intent thread.
 */
export interface Conversation {
  id: string;
  title: string;
  agent: string;
  agentId: string;
  lastMessage: string;
  lastActivity: string;
  status: "active" | "archived" | "waiting";
  messages: { id: string; role: "user" | "agent"; body: string; at: string }[];
}

/**
 * Scoped agent memory record (working, long-term, semantic).
 */
export interface MemoryRecord {
  id: string;
  scope: "working" | "long-term" | "semantic";
  title: string;
  body: string;
  source: string;
  confidence: number;
  createdAt: string;
  lastAccessed: string;
}

/**
 * Indexed RAG knowledge base document.
 */
export interface KnowledgeDoc {
  id: string;
  name: string;
  type: string;
  status: "processing" | "indexed" | "failed";
  chunks: number;
  embedding: string;
  size: string;
  updatedAt: string;
  retrievals: number;
}

/**
 * Registered tool capability with safety permissions.
 */
export interface Tool {
  id: string;
  name: string;
  category: "Database" | "Developer" | "Web" | "Files" | "System" | "Communication" | "Data";
  description: string;
  permissions: string[];
  status: "enabled" | "disabled" | "requires-approval";
  calls30d: number;
  avgLatency: string;
}

/**
 * LLM reasoning engine description.
 */
export interface Model {
  id: string;
  name: string;
  provider: string;
  availability: "available" | "degraded" | "offline";
  context: string;
  streaming: boolean;
  toolCalling: boolean;
  structuredOutput: boolean;
  role: string;
  latency: string;
}

/**
 * Visual DAG node definition inside a workflow.
 */
export interface WorkflowNode {
  id: string;
  label: string;
  type: "start" | "agent" | "tool" | "condition" | "approval" | "parallel" | "end";
  lane: number;
}

/**
 * Orchestration DAG workflow definition.
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "published" | "draft";
  runs: number;
  successRate: number;
  nodes: WorkflowNode[];
}

/**
 * Real-time event emitted onto the system event bus.
 */
export interface SystemEvent {
  id: string;
  type: string;
  executionId: string;
  source: string;
  status: "ok" | "warn" | "error";
  at: string;
  payload: Record<string, unknown>;
}

/**
 * Scored benchmark test suite result.
 */
export interface Evaluation {
  id: string;
  name: string;
  agent: string;
  score: number;
  latency: string;
  toolSelection: number;
  ragRetrieval: number;
  taskCompletion: number;
  cases: number;
  ranAt: string;
}

/**
 * Unified chronological audit item.
 */
export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  kind: "execution" | "approval" | "knowledge" | "memory" | "config" | "agent";
  at: string;
}
