/**
 * @file apps/console/src/lib/ui-copy/common.ts
 * @description Universal, reusable action labels, status badges, and accessibility text.
 * @module apps/console/lib/ui-copy
 */

export const COMMON_COPY = {
  ACTIONS: {
    CANCEL: "Cancel",
    SAVE: "Save Changes",
    SUBMIT: "Submit",
    DELETE: "Delete",
    CLOSE: "Close",
    EDIT: "Edit",
    BACK: "Go Back",
    REFRESH: "Refresh",
    COPY: "Copy",
    COPIED: "Copied!",
    DOWNLOAD: "Download",
    CLEAR: "Clear",
    OPEN: "Open",
    HIDE: "Hide",
    SHOW: "Show",
    SAVING: "Saving...",
    SELECT_OPTION: "Select option...",
  },
  STATUS: {
    ONLINE: "ONLINE",
    OFFLINE: "OFFLINE",
    CONNECTED: "CONNECTED",
    DISCONNECTED: "DISCONNECTED",
    READY: "READY",
    RUNNING: "RUNNING",
    ERROR: "ERROR",
  },
  THEME: {
    LIGHT: "Light",
    DARK: "Dark",
  },
  A11Y: {
    TOGGLE_THEME: "Toggle color theme",
    PRODUCT_NAV: "Product navigation",
    HOME: "OrchestrAI Cowork home",
    SETTINGS: "Settings & Profile",
    SIGN_OUT: "Sign out",
    SIGN_OUT_SESSION: "Sign out of current session",
    CLOSE_DIALOG: "Close dialog",
    CLEAR_OUTPUT: "Clear output",
    SWITCH_LIGHT: "Switch to Light mode",
    SWITCH_DARK: "Switch to Dark mode",
    GATEWAY_ACTIVE: "Gateway Active",
    LOCAL_CORE: "Control Plane Runtime",
    OUTBOX_BUS_CONNECTED: "Outbox Bus: Connected",
    NEW_EXECUTION: "New Execution",
    SIGN_IN: "Sign In",
    SIGN_OUT_BTN: "Sign Out",
  },
  LOADING: {
    TITLE: "Initializing OrchestrAI Console...",
    DESCRIPTION: "Please wait while we prepare your view.",
    PAGE_TITLE: "Loading page...",
  },
  SIDEBAR: {
    DEFAULT_BRAND_VERSION: "v1.0.0 • enterprise",
    NO_NAV_ITEMS: "No navigation items configured.",
    WORKER_DAEMON: "Worker Daemon",
    REDIS_QUEUE: "Redis Queue",
  },
  BRAND: {
    DEFAULT_NAME: "OrchestrAI",
    MONOGRAM: "O",
    DEFAULT_INITIALS: "OP",
  },
  ERROR: {
    DEFAULT_TITLE: "This page didn't load",
    DEFAULT_DESCRIPTION:
      "Something went wrong on our end. You can try refreshing or head back home.",
    DEFAULT_BOUNDARY: "root_error_component",
    UNKNOWN_ERROR: "Unknown Error",
    TRY_AGAIN: "Try again",
    GO_HOME: "Go home",
    DETAILS: "Details",
    HIDE_DETAILS: "Hide details",
  },
  NOT_FOUND: {
    CODE: "404",
    DEFAULT_TITLE: "Page not found",
    DEFAULT_DESCRIPTION: "The page you're looking for doesn't exist or has been moved.",
    GO_HOME: "Go home",
    HOME_HREF: "/",
  },
  FORM: {
    NO_OPTIONS: "No options available in database",
    PREFIX_SELECTED: "✓ ",
    PREFIX_UNSELECTED: "+ ",
    REQUIRED_MARKER: "*",
  },
  API_ERRORS: {
    DEFAULT_FALLBACK: "An unexpected error occurred",
    NETWORK_CONNECTION:
      "Unable to connect to the server. Please check your network connection or verify that the gateway is running.",
    AUTH_CONNECTION:
      "Unable to connect to the authentication server. Please ensure the backend is running and try again.",
    INVALID_RESPONSE: "Received an invalid response from the server. Please try again in a moment.",
  },
} as const;
