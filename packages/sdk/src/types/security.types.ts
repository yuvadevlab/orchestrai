/**
 * @file packages/sdk/src/types/security.types.ts
 * @description Types for cryptographic authentication, request signing, and cost budgets.
 */

/**
 * Enterprise HMAC signing credentials pair.
 */
export interface HmacCredentials {
  /** Public client identity identifier */
  clientId: string;
  /** Private cryptographic HMAC secret key */
  clientSecret: string;
}

/**
 * Standard API key credentials.
 */
export interface ApiKeyCredentials {
  /** Static API key */
  apiKey: string;
}

/**
 * Bearer token credentials.
 */
export interface BearerCredentials {
  /** JWT or OAuth2 Bearer token */
  token: string;
}

/**
 * Union of supported authentication credential formats.
 */
export type AuthCredentials = HmacCredentials | ApiKeyCredentials | BearerCredentials;

/**
 * Client-side financial and token budget constraints preventing runaway execution costs.
 */
export interface CostBudgetOptions {
  /** Maximum financial spend allowed for this execution in USD */
  maxBudgetUsd?: number;
  /** Maximum cumulative input + output tokens allowed */
  maxTokenBudget?: number;
  /** Maximum autonomous execution loop steps */
  maxSteps?: number;
}

/**
 * Cryptographic headers appended by the HMAC request signing engine.
 */
export interface SignedRequestHeaders {
  "x-orchestrai-client-id": string;
  "x-orchestrai-timestamp": string;
  "x-orchestrai-nonce": string;
  "x-orchestrai-signature": string;
  "x-orchestrai-content-hash": string;
  [header: string]: string;
}
