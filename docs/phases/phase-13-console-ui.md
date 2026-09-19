# Phase 13 — Console Dashboard UI

> **Target App**: `apps/console`
> **Status**: Complete (16 screens live, mock data, navigation rail)
> **Stack**: Next.js 15 App Router · React 19 · Tailwind 4 · `@yuva-devlab/ui` · `@yuva-devlab/tokens`

---

## 1. Overview

Phase 13 delivers the full operator console for OrchestrAI — a high-density, dark-mode,
terminal-inspired web application that mirrors the complete set of platform capabilities.

All screens share:

- A **56 px vertical navigation rail** (`ProductNav`) with icon + tooltip.
- A **`PageShell`** wrapper that provides consistent title, breadcrumb, description, and
  optional action bar.
- **Mock data** in `src/lib/mock-db*` so every screen renders correctly before backend
  integration.
- **Strict 250-line rule** — every single file in `apps/console` is < 135 lines.

---

## 2. Application Shell

### 2.1 Root Layout — `app/layout.tsx`

| Concern  | Detail                                                                  |
| -------- | ----------------------------------------------------------------------- |
| Font     | Geist Mono (Google Fonts), applied via CSS variable `--font-geist-mono` |
| Theme    | `@yuva-devlab/tokens` Terminal Moss theme (`theme-orchestrai.css`)      |
| Metadata | SEO title "OrchestrAI Console", description set                         |

### 2.2 Dashboard Layout — `app/(dashboard)/layout.tsx`

Wraps every dashboard route with:

```
┌────┬───────────────────────────────────┐
│ 56 │                                   │
│ px │     {children} — route page       │
│ nav│                                   │
└────┴───────────────────────────────────┘
```

### 2.3 Navigation Rail — `components/layout/product-nav.tsx`

Defines **13 nav destinations** (+ Settings at the bottom):

| #   | Route            | Icon             | Purpose                    |
| --- | ---------------- | ---------------- | -------------------------- |
| 1   | `/`              | Waypoints        | Command Center / Overview  |
| 2   | `/console`       | Network          | Live Prompt Executor       |
| 3   | `/agents`        | Bot              | Agent Roster Directory     |
| 4   | `/conversations` | MessagesSquare   | Multi-turn Thread History  |
| 5   | `/executions`    | Activity         | Execution Runs Table       |
| 6   | `/memory`        | Brain            | Agent Memory Inspector     |
| 7   | `/knowledge`     | Boxes            | RAG Knowledge Base         |
| 8   | `/tools`         | Wrench           | Tool Registry Catalog      |
| 9   | `/models`        | Cpu              | LLM Provider Catalog       |
| 10  | `/workflows`     | GitBranch        | DAG Workflow Builder       |
| 11  | `/events`        | Radio            | Real-time Event Log        |
| 12  | `/evaluations`   | GaugeCircle      | Benchmark Scorecards       |
| 13  | `/activity`      | Settings2        | System Audit Timeline      |
| —   | `/settings`      | User Avatar (YP) | Config and System Settings |

---

## 3. Screen Inventory (16 Screens)

### Screen 1 — Overview / Command Center (`/`)

**Feature module**: `src/features/overview/`

| Component                    | Purpose                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `topology-constellation.tsx` | Animated SVG background — radial network of agent nodes pulsing with live connections            |
| `command-center-hero.tsx`    | Central prompt dispatch widget — operator types a task, chooses agent/mode, fires execution      |
| `overview-grids.tsx`         | 3-column summary grid: active agent network cards, recent execution runs, system pulse telemetry |

**UX Flow**:

1. Operator arrives and sees the topology canvas animated in the background.
2. A live badge shows the count of `running` executions.
3. They type a prompt in the Command Center hero, pick an agent, select mode (CHAT/PLAN/ACT/AUTO), hit "Run".
4. The overview grids update in real time showing the new run.

**Backend integration target**: POST `/api/v1/agents/:id/execute` then SSE stream.

---

### Screen 2 — Console (`/console`)

**Feature module**: `src/features/console/`

**Purpose**: The operator's primary work area — a live prompt executor with SSE-streamed agent
responses, Human-in-the-Loop (HITL) approval controls, and token telemetry.

**Key UI elements**:

| Element                        | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| Prompt input bar               | Multiline textarea with agent/mode selectors and "Run" button      |
| SSE event stream panel         | Scrollable card rendering each lifecycle event as it arrives       |
| Agent markdown output card     | Renders final textual response with syntax-highlighted code blocks |
| Token telemetry footer         | Shows prompt tokens, completion tokens, total cost estimate        |
| HITL approval banner           | Orange alert when a dangerous tool triggers approval interrupt     |
| Activity event log             | Expandable accordion of execution events showing input/output JSON |
| Execution Rail (right sidebar) | Progress bar, current step label, elapsed time, metrics            |

**UX Flow**:

1. Operator types a task in the prompt bar.
2. Console streams events as the agent runs through model, tool, memory nodes.
3. If a HITL-flagged tool is encountered, the console pauses with the approval banner.
4. Operator approves (execution resumes) or rejects (tool call skipped).
5. Final markdown response appears below the stream.

**State model** (React): `useState` for prompt, running, blocked (HITL), stepIndex, progress, expandedId.

**Backend integration target**: SSE `/api/v1/executions/:id/stream` + POST `/api/v1/approvals/:id`.

---

### Screen 3 — Agents (`/agents`)

**Feature module**: `src/features/agents/`

**Purpose**: Directory listing of every registered agent entity — roles, operating mode,
capabilities, reliability stats.

**Card anatomy**:

```
[Glyph]  Name                [Status Chip]
         Role

Short description (2 lines max)

[cap1]  [cap2]  [cap3]
----------------------------------------
142 runs    98% ok    3.2s avg
```

**UX Flow**: Operator scans agent cards → clicks a card to navigate to `/agents/:agentId`.

---

### Screen 4 — Agent Detail (`/agents/:agentId`)

**Purpose**: Detailed studio view for a single agent. Serves as the operator's inspector for
understanding an agent's full configuration and history.

**Layout**: 3-column grid on large screens.

| Section                        | Content                                                       |
| ------------------------------ | ------------------------------------------------------------- |
| Instructions panel (2/3 width) | Full system prompt / instructions text                        |
| Execution history panel        | Linked list of past runs for this agent to `/executions/:id`  |
| Identity sidebar               | Glyph, role, ID, model, mode, success rate, token consumption |
| Capabilities panel             | Tag cloud of named capability strings                         |
| Attached Tools panel           | Monospaced tool name chips with primary accent                |

**Backend integration target**: GET `/api/v1/agents/:id` and GET `/api/v1/executions?agentId=:id`.

---

### Screen 5 — Conversations (`/conversations`)

**Feature module**: page-only (no dedicated feature module yet).

**Purpose**: Management view for multi-turn operator-agent intent threads. Each conversation
can be resumed from the console with its full execution context.

**Layout**: Split-panel (sidebar list + message transcript).

| Panel        | Content                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| Left (20rem) | Thread list — title, status chip, last message preview, agent name                  |
| Right        | Full message transcript — chat bubbles (user = right-aligned, agent = left-aligned) |

**UX Flow**:

1. Operator selects a conversation from the left list.
2. Right panel shows the full message history.
3. "Resume in Console" (future) navigates to `/console` with context pre-loaded.

**Backend integration target**: GET `/api/v1/conversations`, GET `/api/v1/conversations/:id/messages`.

---

### Screen 6 — Executions (`/executions`)

**Feature module**: `src/features/executions/`

**Purpose**: Tabular view of all agent execution runs with status, duration, token counts,
and mode labels.

**Table columns**: Task description · Agent · Mode badge · Duration · Tools used · Tokens · Status chip

**UX Flow**: Operator sees a full run history, can filter by status/agent, click a row to
go to `/executions/:id`.

---

### Screen 7 — Execution Detail (`/executions/:executionId`)

**Purpose**: Deep-dive replayable view of a single execution run.

**Layout**: 2-column (main content + telemetry sidebar).

| Section                | Content                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| Progress bar           | Animated fill showing real-time completion %                      |
| HITL Alert             | Approval banner for live HITL (same pattern as `/console`)        |
| Execution Event Log    | Expandable accordion of all lifecycle events via `ActivityRunner` |
| Execution Rail (right) | Metrics: tokens, tools, sources, elapsed, running/blocked states  |

**Backend integration target**: GET `/api/v1/executions/:id` + SSE for live runs + POST `/api/v1/approvals/:id`.

---

### Screen 8 — Memory (`/memory`)

**Purpose**: Agent memory inspector examining working, long-term, and semantic memory scopes.

**Filter bar**: SCOPE tabs — `all | working | long-term | semantic` (client-side filter).

**Card anatomy**:

```
[scope badge]              87% confidence
Memory title
Body text (2 lines)
----------------------------------------
████████░░░░  87%
source · created 2d ago · recalled 1h ago
```

**Backend integration target**: GET `/api/v1/memory?agentId=&scope=`.

---

### Screen 9 — Knowledge (`/knowledge`)

**Purpose**: RAG knowledge base viewer — shows every indexed document, its embedding model,
chunk count, retrieval statistics, and indexing status.

**Card anatomy**:

```
Document name              [Status Chip]
type · size
----------------------------------------
  124         38          2d ago
 chunks    retrievals     updated
text-embedding-3-small
```

**Backend integration target**: GET `/api/v1/knowledge/documents`.

---

### Screen 10 — Tools (`/tools`)

**Feature module**: `src/features/tools/`

**Purpose**: Registry catalog of all tools available to agents — shows permissions, safety
level, 30-day call volume, and average latency.

**Card anatomy**: Tool name · Category badge · Description · Permission tags · Status chip ·
30d calls · Avg latency.

**Statuses**: `enabled` | `disabled` | `requires-approval` (HITL marker).

**Backend integration target**: GET `/api/v1/tools`.

---

### Screen 11 — Models (`/models`)

**Feature module**: `src/features/models/`

**Purpose**: LLM provider catalog showing capability matrix (streaming, tool calling,
structured output), pricing, context window, and availability status.

**Card anatomy**: Model name · Provider · Role · Availability chip · Context size ·
Capability checkmarks · Latency · Pricing per 1M tokens.

**Backend integration target**: GET `/api/v1/models`.

---

### Screen 12 — Workflows (`/workflows`)

**Feature module**: `src/features/workflows/`

**Purpose**: Visual DAG pipeline builder — shows registered orchestration workflows, their
run counts, success rates, and a miniature node-graph preview.

**Card anatomy**: Workflow name · Description · Status (published/draft) · Run stats ·
Visual DAG node row (start → agents → tools → conditions → end).

**Backend integration target**: GET `/api/v1/workflows`.

---

### Screen 13 — Events (`/events`)

**Purpose**: Real-time system event log — every signal emitted onto the platform's event bus.
Operators can expand any row to inspect the raw JSON payload.

**Accordion pattern**: Compact row (type · source · executionId · timestamp · status chip)
expands to `<pre>` JSON block.

**Event types** (from `@orchestrai/core`): `execution:started`, `execution:completed`,
`step:started`, `tool:called`, `approval:required`, `outbox:flushed`, etc.

**Backend integration target**: WebSocket `/ws/events` or SSE `/api/v1/events/stream`.

---

### Screen 14 — Evaluations (`/evaluations`)

**Purpose**: Benchmark scorecard for agent quality testing — aggregate scores and
per-dimension breakdowns for tool selection accuracy, RAG retrieval, and task completion.

**Scorecard anatomy**:

```
Eval Suite Name                    92.4
Agent · N cases
----------------------------------------
Tool selection accuracy  ████████░  94%
RAG retrieval accuracy   ███████░░  89%
Task completion rate     ████████░  95%
2.1s avg · ran 2h ago
```

**Backend integration target**: GET `/api/v1/evaluations`.

---

### Screen 15 — Activity (`/activity`)

**Feature module**: `src/features/activity/`

**Purpose**: Chronological audit timeline for all system-wide events — executions, approvals,
knowledge updates, memory writes, config changes, agent registrations.

**Layout**: Left-bordered timeline list (`<ol>`) with icon badges per event kind.

| Kind      | Icon        |
| --------- | ----------- |
| execution | Zap         |
| approval  | ShieldCheck |
| knowledge | Boxes       |
| memory    | Brain       |
| config    | Settings2   |
| agent     | Bot         |

**Backend integration target**: GET `/api/v1/activity?limit=50&cursor=`.

---

### Screen 16 — Settings (`/settings`)

**Feature module**: `src/features/settings/`

**Purpose**: System configuration panel — PostgreSQL topology viewer, transactional outbox
poller toggle, security execution limits, and operator profile.

**Sections**:

- Database topology (PostgreSQL, Redis connection status)
- Outbox poller toggle (enables/disables the transactional outbox flush daemon)
- Security limits (max execution duration, max tool calls per step, HITL threshold)
- Operator profile (user ID, role, API key display)

**Backend integration target**: GET/PATCH `/api/v1/settings`.

---

## 4. Tech Stack Analysis

### Core Technologies

| Technology       | Version         | Role        | Justification                                                                                          |
| ---------------- | --------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| **Next.js**      | 15.x App Router | Framework   | SSR, file-based routing, Server Components for static shell, Client Components for interactive widgets |
| **React**        | 19.x            | UI library  | Concurrent features, `use()` hook for future Suspense-based data fetching                              |
| **TypeScript**   | 6.x strict      | Type safety | Strict mode, no implicit any, exhaustive discriminated unions                                          |
| **Tailwind CSS** | 4.x             | Styling     | `@theme inline` design tokens, zero runtime CSS-in-JS                                                  |

### Design System

| Package               | Source                                      | Role                                                                                   |
| --------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `@yuva-devlab/tokens` | `design-system/packages/tokens` (symlinked) | Color, spacing, typography CSS variables + theme presets                               |
| `@yuva-devlab/ui`     | `design-system/packages/ui` (symlinked)     | 46 production-ready components (Button, Panel, StatusChip, Alert, Tooltip, Card, etc.) |

### Supporting Libraries

| Library                      | Version   | Purpose             | Current Usage                                                          |
| ---------------------------- | --------- | ------------------- | ---------------------------------------------------------------------- |
| **lucide-react**             | 0.575     | Icon library        | Active: all nav icons, activity kind icons, alert icons                |
| **clsx + tailwind-merge**    | latest    | Class utilities     | Active: `cn()` helper used across all components                       |
| **class-variance-authority** | 0.7       | Variant components  | Active: in `@yuva-devlab/ui`                                           |
| **recharts**                 | 2.x       | Data visualization  | Pre-staged: token usage charts, latency histograms (Phase 12/19)       |
| **sonner**                   | 2.x       | Toast notifications | Pre-staged: approval toasts (Phase 12)                                 |
| **date-fns**                 | 4.x       | Date formatting     | Pre-staged: real relative timestamps replacing mock strings (Phase 12) |
| **zod**                      | 3.x       | Runtime validation  | Pre-staged: form validation in settings, console prompt (Phase 12+)    |
| **@orchestrai/core**         | workspace | Domain contracts    | Pre-staged: replace mock-db with real API types (Phase 17)             |
| **@orchestrai/shared-types** | workspace | Shared enums        | Pre-staged: replace mock-db with real API types (Phase 17)             |

> **NOTE**: `recharts`, `sonner`, `date-fns`, `@orchestrai/core`, and `@orchestrai/shared-types`
> are correctly installed as forward-staged dependencies. None are "unwanted" — they are
> intentionally pre-declared for upcoming integration phases. SSR tree-shaking removes unused
> imports from the production bundle.

---

## 5. Feature vs. Route Completeness

| Route                      | Feature Module                     | Implementation             |
| -------------------------- | ---------------------------------- | -------------------------- |
| `/`                        | `features/overview`                | Full feature module        |
| `/console`                 | `features/console`                 | Full feature module        |
| `/agents`                  | `features/agents`                  | Full feature module        |
| `/agents/:agentId`         | —                                  | Page-only                  |
| `/conversations`           | —                                  | Page-only (self-contained) |
| `/executions`              | `features/executions`              | Full feature module        |
| `/executions/:executionId` | `features/executions` (components) | Full feature module        |
| `/memory`                  | —                                  | Page-only (self-contained) |
| `/knowledge`               | —                                  | Page-only (self-contained) |
| `/tools`                   | `features/tools`                   | Full feature module        |
| `/models`                  | `features/models`                  | Full feature module        |
| `/workflows`               | `features/workflows`               | Full feature module        |
| `/events`                  | —                                  | Page-only (self-contained) |
| `/evaluations`             | —                                  | Page-only (self-contained) |
| `/activity`                | `features/activity`                | Full feature module        |
| `/settings`                | `features/settings`                | Full feature module        |

Five screens (`/conversations`, `/memory`, `/knowledge`, `/events`, `/evaluations`) are
fully functional but self-contained in their `page.tsx`. When backend wiring begins in
Phase 12+, these should be refactored into dedicated feature modules.

---

## 6. Data Layer (Current: Mock)

All data is served from mock data files in `src/lib/`:

| File                      | Exports                                             | Consumed By                                |
| ------------------------- | --------------------------------------------------- | ------------------------------------------ |
| `mock-db-agents.ts`       | `agents[]`                                          | Agents, Agent Detail, Overview             |
| `mock-db-executions.ts`   | `executions[]`, `conversations[]`, `memories[]`     | Executions, Console, Conversations, Memory |
| `mock-db-knowledge.ts`    | `knowledgeDocs[]`                                   | Knowledge                                  |
| `mock-db-events-evals.ts` | `systemEvents[]`, `evaluations[]`, `activityFeed[]` | Events, Evaluations, Activity              |
| `mock-db-workflows.ts`    | `workflows[]`                                       | Workflows                                  |
| `mock-db-tools-models.ts` | `tools[]`, `models[]`                               | Tools, Models                              |
| `mock-db-telemetry.ts`    | telemetry constants                                 | Overview grids                             |
| `types.ts`                | All UI domain interfaces                            | Every screen                               |

**Barrel chain**: `mock-db.ts` → `mock-db-entities.ts` → individual data files.

---

## 7. Component Architecture Map

```
apps/console/src/
├── app/
│   ├── layout.tsx                     # Root HTML shell, fonts, theme
│   └── (dashboard)/
│       ├── layout.tsx                 # ProductNav + child viewport
│       ├── page.tsx                   # Screen 1: Overview
│       ├── console/page.tsx           # Screen 2: Console
│       ├── agents/
│       │   ├── page.tsx               # Screen 3: Agent Roster
│       │   └── [agentId]/page.tsx     # Screen 4: Agent Detail
│       ├── conversations/page.tsx     # Screen 5: Conversations
│       ├── executions/
│       │   ├── page.tsx               # Screen 6: Execution Table
│       │   └── [executionId]/page.tsx # Screen 7: Execution Detail
│       ├── memory/page.tsx            # Screen 8: Memory
│       ├── knowledge/page.tsx         # Screen 9: Knowledge
│       ├── tools/page.tsx             # Screen 10: Tools
│       ├── models/page.tsx            # Screen 11: Models
│       ├── workflows/page.tsx         # Screen 12: Workflows
│       ├── events/page.tsx            # Screen 13: Events
│       ├── evaluations/page.tsx       # Screen 14: Evaluations
│       ├── activity/page.tsx          # Screen 15: Activity
│       └── settings/page.tsx         # Screen 16: Settings
├── components/
│   ├── layout/
│   │   ├── product-nav.tsx            # 56px vertical nav rail (active)
│   │   └── page-shell.tsx             # Title/breadcrumb/actions wrapper (active)
│   └── dashboard/
│       ├── dashboard-shell.tsx        # Legacy — not imported, should be removed
│       ├── sidebar-nav.tsx            # Legacy — not imported, should be removed
│       └── top-bar.tsx                # Legacy — not imported, should be removed
├── features/
│   ├── overview/                      # topology-constellation, command-center-hero, overview-grids
│   ├── console/                       # prompt-bar, sse-stream, hitl-banner, markdown-output, activity-runner, execution-rail
│   ├── agents/                        # agent-card
│   ├── executions/                    # execution-table, activity-runner, execution-rail
│   ├── tools/                         # tool-card
│   ├── models/                        # model-card
│   ├── workflows/                     # workflow-card
│   ├── activity/                      # activity-feed
│   └── settings/                      # settings panels
└── lib/
    ├── mock-db*.ts                    # Mock data (to be replaced by API calls Phase 12+)
    ├── types.ts                       # UI domain interfaces
    └── utils.ts                       # cn() Tailwind class utility
```

**Cleanup note**: `components/dashboard/` holds three legacy files (`DashboardShell`,
`SidebarNav`, `TopBar`) that are not imported anywhere. These should be deleted as part of
the Phase 13 cleanup sub-task (13.7).

---

## 8. Backend Wiring Roadmap (Sub-Phases)

| Sub-Phase | Task                                                           | Depends On                   |
| --------- | -------------------------------------------------------------- | ---------------------------- |
| 13.1      | Replace mock-db with real API fetch in Server Components       | Phase 17 (API Gateway)       |
| 13.2      | Wire SSE event stream in `/console` and `/executions/:id`      | Phase 12 (Realtime Streamer) |
| 13.3      | Implement HITL approval POST in console                        | Phase 11 (HITL)              |
| 13.4      | Refactor page-only screens into feature modules                | After 13.1                   |
| 13.5      | Add recharts visualizations (token usage, latency histograms)  | Phase 19 (Observability)     |
| 13.6      | Implement sonner toasts for approval/rejection actions         | After 13.3                   |
| 13.7      | Remove legacy `components/dashboard/` files                    | Any time                     |
| 13.8      | Replace mock relative timestamps with real date-fns formatting | After 13.1                   |

---

## 9. Quality Gates (Verified)

| Gate                               | Result |
| ---------------------------------- | ------ |
| All files < 135 lines              | PASS   |
| `pnpm lint` (0 errors, 0 warnings) | PASS   |
| `pnpm typecheck` (0 TS errors)     | PASS   |
| `pnpm build` (Next.js production)  | PASS   |
| All 16 routes respond 200          | PASS   |
| No unused imports                  | PASS   |
| JSDoc on all exports               | PASS   |
