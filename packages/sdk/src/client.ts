/**
 * @file packages/sdk/src/client.ts
 * @description Master client class providing fluent access to OrchestrAI platform resources.
 */

import type { OrchestrAIClientOptions } from "./types";
import { HttpClient } from "./transport";
import {
  AgentsResource,
  ExecutionsResource,
  ConversationsResource,
  RagResource,
  ApprovalsResource,
  WorkflowsResource,
  ToolsResource,
  ModelsResource,
} from "./resources";

/**
 * Official client for interacting with the OrchestrAI platform.
 */
export class OrchestrAIClient {
  /** Underlying HTTP transport managing HMAC signing, retries, and streaming */
  public readonly http: HttpClient;

  /** Agent definitions and execution dispatch */
  public readonly agents: AgentsResource;

  /** Execution state queries, control, and event streaming */
  public readonly executions: ExecutionsResource;

  /** Multi-turn conversation sessions and message histories */
  public readonly conversations: ConversationsResource;

  /** Knowledge document ingestion and semantic vector retrieval */
  public readonly rag: RagResource;

  /** Human-in-the-loop operator approval workflows */
  public readonly approvals: ApprovalsResource;

  /** Workflow DAG pipeline definitions */
  public readonly workflows: WorkflowsResource;

  /** Tool plugins and sandbox registrations */
  public readonly tools: ToolsResource;

  /** Model provider endpoints and routing configurations */
  public readonly models: ModelsResource;

  constructor(options: OrchestrAIClientOptions = {}) {
    this.http = new HttpClient(options);
    this.agents = new AgentsResource(this.http, options);
    this.executions = new ExecutionsResource(this.http, options);
    this.conversations = new ConversationsResource(this.http, options);
    this.rag = new RagResource(this.http, options);
    this.approvals = new ApprovalsResource(this.http, options);
    this.workflows = new WorkflowsResource(this.http, options);
    this.tools = new ToolsResource(this.http, options);
    this.models = new ModelsResource(this.http, options);
  }
}
