/**
 * @fileoverview Mock database conversations, memories, and knowledge documents.
 * Adheres strictly to the 250-line maximum rule.
 */

import type { Conversation, MemoryRecord, KnowledgeDoc } from "./types";

/**
 * Multi-turn conversational interaction threads.
 */
export const conversations: Conversation[] = [
  {
    id: "CONV-01",
    title: "Design System Architecture Consultation",
    agent: "Supervisor Agent",
    agentId: "supervisor",
    lastMessage: "I have prepared the multi-lane visual workflow editor plan.",
    lastActivity: "10 minutes ago",
    status: "active",
    messages: [
      {
        id: "m1",
        role: "user",
        body: "Can we review the component design system architecture between FinAI and OrchestrAI?",
        at: "10:14 AM",
      },
      {
        id: "m2",
        role: "agent",
        body: "Certainly. Both applications consume @yuva-devlab/ui for Radix primitives, while maintaining independent semantic tokens via preset.css.",
        at: "10:15 AM",
      },
      {
        id: "m3",
        role: "user",
        body: "Make sure all 13 screens from lovable are represented in the console.",
        at: "10:20 AM",
      },
      {
        id: "m4",
        role: "agent",
        body: "I have prepared the multi-lane visual workflow editor plan and all 13 screens.",
        at: "10:21 AM",
      },
    ],
  },
  {
    id: "CONV-02",
    title: "Worker Daemon Performance Tuning",
    agent: "Developer Agent",
    agentId: "developer",
    lastMessage: "Concurrency pool adjusted to 4 workers with BullMQ backoff.",
    lastActivity: "2 hours ago",
    status: "active",
    messages: [
      {
        id: "m1",
        role: "user",
        body: "What is the memory consumption profile of apps/worker?",
        at: "08:30 AM",
      },
      {
        id: "m2",
        role: "agent",
        body: "Currently hovering at 142MB RSS across 4 BullMQ workers.",
        at: "08:32 AM",
      },
    ],
  },
];

/**
 * Long-term, working, and semantic memories retained across runs.
 */
export const memories: MemoryRecord[] = [
  {
    id: "MEM-01",
    scope: "long-term",
    title: "Single Workers Surface Deployment",
    body: "Production deployment targets a single Cloudflare/Node daemon rather than fragmented microservices.",
    source: "operator instruction",
    confidence: 0.98,
    createdAt: "3 days ago",
    lastAccessed: "2 hours ago",
  },
  {
    id: "MEM-02",
    scope: "long-term",
    title: "250-Line Code Maximum Rule",
    body: "Strict monorepo invariant: no source code file may exceed 250 lines. Decompose early at 200 lines.",
    source: "AGENTS.md",
    confidence: 1.0,
    createdAt: "5 days ago",
    lastAccessed: "Just now",
  },
  {
    id: "MEM-03",
    scope: "semantic",
    title: "Outbox Pattern for Agent Events",
    body: "Store local event entries atomically in SQLite/Postgres before publishing over WebSocket or message broker.",
    source: "architecture-review.md",
    confidence: 0.94,
    createdAt: "2 days ago",
    lastAccessed: "1 hour ago",
  },
  {
    id: "MEM-04",
    scope: "working",
    title: "Active DAG Run EXE-8F29A Context",
    body: "Evaluating approval hold on data-agent schema inspect request.",
    source: "Supervisor Agent",
    confidence: 0.88,
    createdAt: "15 minutes ago",
    lastAccessed: "5 minutes ago",
  },
];

/**
 * Indexed RAG knowledge base documents.
 */
export const knowledgeDocs: KnowledgeDoc[] = [
  {
    id: "KNOW-01",
    name: "orchestrai-agent-specification.pdf",
    type: "PDF",
    status: "indexed",
    chunks: 428,
    embedding: "BGE-M3 (1024d)",
    size: "2.4 MB",
    updatedAt: "Today",
    retrievals: 1240,
  },
  {
    id: "KNOW-02",
    name: "postgres-indexing-and-partitioning.md",
    type: "Markdown",
    status: "indexed",
    chunks: 184,
    embedding: "BGE-M3 (1024d)",
    size: "640 KB",
    updatedAt: "Yesterday",
    retrievals: 812,
  },
  {
    id: "KNOW-03",
    name: "system-threat-model-and-safety-gates.docx",
    type: "DOCX",
    status: "indexed",
    chunks: 310,
    embedding: "BGE-M3 (1024d)",
    size: "1.8 MB",
    updatedAt: "2 days ago",
    retrievals: 490,
  },
  {
    id: "KNOW-04",
    name: "vector-similarity-benchmarks.csv",
    type: "CSV",
    status: "processing",
    chunks: 92,
    embedding: "BGE-M3 (1024d)",
    size: "320 KB",
    updatedAt: "Just now",
    retrievals: 0,
  },
];
