/**
 * @file apps/console/src/lib/ui-copy/settings.ts
 * @description Centralized UI copy and placeholders for Workspace Settings.
 * @module apps/console/lib/ui-copy
 */

export const SETTINGS_COPY = {
  PAGE_TITLE: "Settings",
  BREADCRUMB: "Settings",
  PAGE_DESCRIPTION: "Your profile, keys and preferences.",
  SAVE_BUTTON: "Save changes",
  PROFILE: {
    TITLE: "Profile",
    DESCRIPTION: "Your user identity and tenancy permissions.",
    NAME_LABEL: "Name",
    EMAIL_LABEL: "Email",
    ROLE_LABEL: "Role",
    TENANT_LABEL: "Tenant Workspace",
  },
  ACCOUNT: {
    TITLE: "Active operator profile",
    BADGE_ACTIVE: "ACTIVE SESSION",
    FALLBACK_OPERATOR: "Operator",
    SIGN_OUT_SESSION: "Sign out session",
    SESSION_STATE: "Session state",
    ACTIVE_SESSION: "Active session",
    TENANT_PARTITION: "Tenant partition",
    COPY_TENANT_TOOLTIP: "Copy Full Tenant ID",
  },
  API_KEYS: {
    TITLE: "API Keys & Integration Tokens",
    DESCRIPTION: "Bring your own provider keys for custom inference quotas and private routing.",
    PLACEHOLDER: "sk-••••••••",
  },
  PREFERENCES: {
    TITLE: "Preferences",
    DESCRIPTION: "Application appearance and supervisor delegation behavior.",
    THEME_LABEL: "Theme",
    THEME_DESC: "Select your preferred interface color mode.",
    DEFAULT_AGENT_LABEL: "Default specialist",
    DEFAULT_AGENT_DESC: "Primary agent targeted when starting new prompts.",
    DEFAULT_AGENT_PLACEHOLDER: "Auto-route (Supervisor)",
    NOTIFICATIONS_LABEL: "Notifications on run completion",
    NOTIFICATIONS_DESC: "Receive in-app toast updates when background runs finish.",
    AUTONOMY_LABEL: "Autonomous delegation",
    AUTONOMY_DESC: "Allow orchestrator to recruit specialist agents without prompt confirmation.",
  },
  DATABASE: {
    TITLE: "PostgreSQL & Outbox Topology",
    DESCRIPTION: "Primary relational connection and pgvector storage parameters.",
    URI_LABEL: "Database Connection URI",
    OUTBOX_TITLE: "Transactional Outbox Poller",
    OUTBOX_DESC: "Automatically flush unpublished outbox records",
    OUTBOX_A11Y: "Toggle transactional outbox poller",
  },
  TOAST: {
    SAVING: "Saving workspace preferences...",
    SAVED: "Settings saved successfully",
    ERROR: "Failed to save settings",
  },
} as const;
