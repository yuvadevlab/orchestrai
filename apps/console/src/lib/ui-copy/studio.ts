/**
 * @file apps/console/src/lib/ui-copy/studio.ts
 * @description Centralized UI copy, placeholders, and a11y text for Cowork Studio.
 * @module apps/console/lib/ui-copy
 */

export const STUDIO_COPY = {
  FEED: {
    NEW_OUTPUT_STREAMING: "New output streaming below",
    NEW_OUTPUT_A11Y: "Scroll to newest output streaming below",
    COPY_RESPONSE: "Copy response",
    USER_LABEL: "You",
    DEFAULT_SPECIALIST: "Autonomous Specialist",
    SYNTHESIZING: "Agent synthesizing and generating outputs...",
    TOKENS_DIAGNOSTIC: (tokensIn: number, tokensOut: number) =>
      `Tokens: ${tokensIn.toLocaleString()} in / ${tokensOut.toLocaleString()} out`,
    EXEC_DIAGNOSTIC: (executionId: string) => `Exec: ${executionId}`,
  },
  STREAM: {
    /** Fallback label when a tool call has no name (malformed SSE payload) */
    UNKNOWN_TOOL: "unknown",
    /** Fallback artifact language when none is provided in the SSE payload */
    DEFAULT_ARTIFACT_LANGUAGE: "typescript",
    /** Clearance required event label template */
    CLEARANCE_REQUIRED: (target: string) => `Clearance required: ${target}`,
    /** Default resource label used when approval request has no target */
    DEFAULT_RESOURCE_TARGET: "resource",
  },
  HEADER: {
    THREADS_BUTTON: "Threads",
    THREADS_TOOLTIP: "Open session threads history",
    STATUS_COLLABORATING: "COLLABORATING...",
    STATUS_READY: "SWARM // READY",
    TOGGLE_INSPECTOR_A11Y: "Toggle inspector rail",
  },
  DRAWER: {
    TITLE: "Session Threads",
    THREADS_LABEL: "Threads",
    SEARCH_PLACEHOLDER: "Search threads...",
    NEW_THREAD: "New Thread",
    NO_MATCHING_THREADS: "No matching threads.",
    NO_SAVED_THREADS: "No saved threads yet.",
    START_THREAD_HINT: "Send a message in the studio to start a thread.",
    CLOSE_A11Y: "Close session threads",
    CLOSE_TOOLTIP: "Close sidebar",
    THREAD_OPTIONS_A11Y: "Thread options",
    DELETE_THREAD: "Delete Thread",
  },
  PROMPT: {
    PLACEHOLDER: "Describe any objective — use @ to mention files/specialists, / for commands…",
    RUN_A11Y: "Run",
    STOP_A11Y: "Stop execution",
    SELECT_SPECIALIST: "Select specialist",
    SELECT_MODEL: "Select model engine",
    SELECT_MODE: "Select mode",
    LOADING_AGENTS: "Loading agents...",
    LOADING_MODELS: "Loading models...",
    LOADING_MODES: "Loading modes...",
  },
  FILE: {
    UPLOAD_A11Y: "Upload document",
    UPLOAD_TOOLTIP: "Upload & index document (ChatGPT style)",
    INDEXED: "indexed",
    REMOVE_TOOLTIP: "Remove attachment",
  },
  CLEARANCE: {
    A11Y_REQUIRED: "Security clearance required",
    TITLE_SECURITY: "Security Clearance Required",
    TITLE_SENSITIVE: "Sensitive Action Clearance Required",
    ALLOW_ONCE: "Allow Once",
    THIS_CHAT: "This Chat",
    ALLOW_THIS_CHAT: "Allow for this Chat",
    ALWAYS_ALLOW: "Always Allow",
    DENY: "Deny",
    REQUESTED_TARGET: "Requested Target",
    PROTECTED_FILE: "Protected File",
    DECISION_LOG_A11Y: (scope: string) => `Permission decision: ${scope}`,
    DENIED_LABEL: "Permission Denied",
    GRANTED_LABEL: (scope: string) => `Clearance Granted (${scope})`,
    DENIED_SHORT: "Denied",
    CLEARED_SHORT: (scope: string) => `Cleared (${scope})`,
    DRAWER: {
      TITLE: "Security Clearance Required",
      PENDING_COUNT: (count: number) =>
        `${count} pending approval ${count === 1 ? "ticket" : "tickets"}`,
      RISK_LEVEL: (risk: string) => `Risk Level: ${risk}`,
      TICKET_ID: (id: string) => `ID: ${id}`,
      INVOKING_TOOL: "Invoking Tool",
      BLAST_RADIUS: "Blast-Radius Target Resources",
      PAYLOAD_PARAMS: "Payload Parameters",
      EMPTY_DESC: "No pending clearance tickets require intervention.",
      DENY_ACTION: "Deny Action",
      APPROVE_ACTION: "Approve (⌘+Enter)",
      DISMISS: "Dismiss ticket from queue",
    },
  },

  WORKSPACE: {
    OPEN_FOLDER: "Open Folder",
    ENTER_PATH: "Enter Path...",
    PATH_PLACEHOLDER: "/Users/.../my-project",
    OPEN_BUTTON: "Open",
    RECENTS_TITLE: "Recent Workspaces",
    CLEAR_RECENTS: "Clear",
    REMOVE_TOOLTIP: "Remove from history",
    SELECT_WORKSPACE: "Select Workspace",
    SWITCH_TOOLTIP: "Switch or open workspace",
    ACTIVE_WORKSPACE: "ACTIVE WORKSPACE",
    COPY_PATH: "Copy Path",
  },
  THINKING: {
    TITLE: "Thinking Process",
    HIDE: "Hide",
    SHOW: "Show",
  },
  PLAN: {
    TITLE: "Execution Plan",
    PROGRESS: (completed: number, total: number, pct: number) =>
      `${completed}/${total} Tasks (${pct}%)`,
  },
  INSPECTOR: {
    TITLE: "Inspector",
    SUBTITLE: "Live Stream & Trace",
    TAB_STREAM: (count: number) => `Live Stream (${count})`,
    TAB_TELEMETRY: "Telemetry",
    AWAITING_STREAM: "Awaiting first stream event...",
    NO_LIVE_EVENTS: "No live events in queue. State a goal to stream.",
    HANDLE_LABEL: "Execution Handle",
    ENGINE_LABEL: "Runtime Engine",
    SANDBOX_LABEL: "Sandbox Status",
    LOCAL_FIRST_STATUS: "Zero-Trust Sandboxed Workspace",
    IDLE: "Idle",
  },
  WELCOME: {
    FALLBACK_HEADLINE: "What should your agents take on?",
    FALLBACK_SUBTITLE: "One objective. A swarm of specialists. Auditable results.",
    GREETING: (name: string) => `What should we tackle, ${name}?`,
    /** Fallback name token substituted into server headline when user first name is unknown */
    GREETING_FALLBACK_NAME: "there",
  },
  CANVAS: {
    TABS: {
      CODE: "Code",
      PREVIEW: "Preview",
      DIFF: "Diff",
      TERMINAL: "Terminal",
    },
    CLOSE_A11Y: "Close Canvas",
    DIFF_ORIGINAL: "Original",
    DIFF_MODIFIED: "Modified",
    TERMINAL_NO_OUTPUT: "No command output available yet...",
    RELOAD_PREVIEW: "Reload Preview",
    OPEN_NEW_WINDOW: "Open in new window",
    DEFAULT_PREVIEW_TITLE: "HTML Sandbox Preview",
  },
  ARTIFACTS: {
    OPEN_CANVAS: "Canvas",
    OPEN_CANVAS_TOOLTIP: "Open in Right-Side Canvas",
    COPY_TERMINAL_TOOLTIP: "Copy terminal output",
    LINES_COUNT: (lang: string, lines: number) => `${lang} · ${lines} lines`,
    WORDS_COUNT: (words: number) => `(${words} words)`,
    SOURCES_COUNT: (sources: number) => `${sources} sources`,
    DOWNLOAD_BUTTON: "Download",
  },
  MENTIONS: {
    HEADER_TITLE: "Mentions (@)",
    MATCHES_COUNT: (count: number) => `${count} matches`,
  },
  COMMANDS: {
    HEADER_TITLE: "Commands (/)",
    AVAILABLE_COUNT: (count: number) => `${count} available`,
  },
} as const;
