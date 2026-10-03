/**
 * @file packages/shared-types/src/enums/studio.enums.ts
 * @description Domain enumerations for Cowork Studio artifacts and plan step lifecycles.
 */

/**
 * Rich multi-domain artifact types produced during cowork execution.
 */
export enum ArtifactType {
  DOCUMENT = "document",
  CODE = "code",
  TERMINAL = "terminal",
  SEARCH = "search",
  DATA = "data",
}

/**
 * Execution outcome status of an individual artifact generation.
 */
export enum ArtifactStatus {
  RUNNING = "running",
  SUCCESS = "success",
  ERROR = "error",
}

/**
 * Lifecycle execution status of an individual step in an agent plan.
 */
export enum PlanStepStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Operating mode governing cowork execution and tool autonomy.
 */
export enum CoworkMode {
  CHAT = "chat",
  PLAN = "plan",
  ACT = "act",
  AUTO = "auto",
  AUTONOMOUS = "autonomous",
  RESEARCH = "research",
  PLAN_EXECUTE = "plan_execute",
  DIRECT = "direct",
}

/**
 * Event taxonomy emitted during live streaming agent execution.
 */
export enum StudioEventType {
  THINK = "think",
  PLAN = "plan",
  SEARCH = "search",
  WEB = "web",
  FILE = "file",
  DATABASE = "database",
  DELEGATE = "delegate",
  MODEL = "model",
  TOOL = "tool",
  APPROVAL = "approval",
  RAG = "rag",
  CODE = "code",
}

/**
 * Author role classification for studio conversation messages.
 */
export enum CoworkMessageRole {
  USER = "user",
  AGENT = "agent",
  SYSTEM = "system",
}

/**
 * Server-Sent Event (SSE) wire protocol event types for live agent executions.
 */
export enum SseStreamEvent {
  MESSAGE = "message",
  CHUNK = "chunk",
  ARTIFACT = "artifact",
  APPROVAL_REQUEST = "approval_request",
  TOOL_CALL = "tool_call",
  DONE = "done",
  ERROR = "error",
}

/**
 * Sequential segment types within an interleaved cowork message turn.
 */
export enum MessageSegmentType {
  THINKING = "thinking",
  PLAN = "plan",
  ARTIFACT = "artifact",
  APPROVAL = "approval",
  TEXT = "text",
}

/**
 * Canonical workspace tool names dispatched by the autonomous agent executor.
 * All tool dispatch (switch/case) MUST compare against these enum members —
 * never bare string literals like "read_file" or "bash".
 */
export enum WorkspaceTool {
  /** Reads the content of a file from the sandbox workspace. */
  READ_FILE = "read_file",
  /** Writes content to a file path, creating directories as needed. */
  WRITE_FILE = "write_file",
  /** Lists directory entries under a given path. */
  LIST_DIR = "list_dir",
  /** Executes an arbitrary bash command in the sandbox. */
  BASH = "bash",
  /** Performs a semantic knowledge base search via RAG. */
  KNOWLEDGE_SEARCH = "knowledge_search",
  /** Runs workspace code standards and diagnostics verification (linter, compiler, format). */
  VERIFY_CODE = "verify_code",
  /** Reads the full markdown content and instructions of a workspace skill. */
  READ_SKILL = "read_skill",
  /** Lists all discovered workspace skills with descriptions and trigger conditions. */
  LIST_SKILLS = "list_skills",
}
