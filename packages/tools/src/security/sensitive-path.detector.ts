/**
 * @file packages/tools/src/security/sensitive-path.detector.ts
 * @description Advanced classification of filesystem targets to protect sensitive credentials and secrets.
 * @module @orchestrai/tools/security
 */

import os from "node:os";
import path from "node:path";
import { ApprovalRiskLevel } from "@orchestrai/shared-types";

/**
 * Risk classification level for a filesystem path access request.
 */
export type SensitivityRiskLevel = ApprovalRiskLevel;

/**
 * High-level security category of the target path.
 */
export type SensitivityCategory = "credentials" | "secrets" | "system" | "workspace";

/**
 * Result of evaluating a candidate file path against sensitive patterns.
 */
export interface PathSensitivityClassification {
  /** True if the target matches any sensitive credential, key, or system path */
  readonly isSensitive: boolean;
  /** Overall risk tier associated with reading or writing this path */
  readonly riskLevel: SensitivityRiskLevel;
  /** Categorical domain of the sensitive file */
  readonly category: SensitivityCategory;
  /** Human-readable explanatory warning describing the risk to the operator */
  readonly warning?: string;
}

/**
 * High-risk credential and authentication token paths (Critical risk).
 */
const CRITICAL_CREDENTIAL_PATTERNS: readonly RegExp[] = [
  /[\\/]\.ssh([\\/]|$)/i,
  /[\\/]\.aws([\\/]|$)/i,
  /[\\/]\.gnupg([\\/]|$)/i,
  /[\\/]\.config[\\/]gcloud([\\/]|$)/i,
  /[\\/]\.azure([\\/]|$)/i,
  /[\\/]\.kube([\\/]config)?$/i,
  /[\\/]id_(rsa|ed25519|ecdsa|dsa)(\.pub)?$/i,
  /\.(pem|key|pkcs12|pfx)$/i,
  /^\/(etc[\\/](shadow|passwd|sudoers)|System[\\/]|private[\\/])/i,
];

/**
 * Environment variables and secret token files (Caution risk).
 */
const SECRET_CONFIG_PATTERNS: readonly RegExp[] = [
  /(^|[\\/])\.env(\.[a-zA-Z0-9_-]+)?$/i,
  /(^|[\\/])\.npmrc$/i,
  /(^|[\\/])\.dockercfg$/i,
  /(^|[\\/])\.docker[\\/]config\.json$/i,
  /(^|[\\/])credentials\.json$/i,
  /(^|[\\/])service-account.*\.json$/i,
];

/**
 * Expands leading tilde (~) into the user's home directory.
 *
 * @param targetPath - Candidate path string with potential ~ prefix
 * @returns Fully qualified path string
 */
export function expandUserHome(targetPath: string): string {
  if (!targetPath) return targetPath;
  if (targetPath === "~" || targetPath.startsWith(`~${path.sep}`)) {
    return path.join(os.homedir(), targetPath.slice(1));
  }
  return targetPath;
}

/**
 * Classifies a candidate path by matching against credential and secret signatures.
 *
 * @param candidatePath - The absolute or relative path targeted by the tool call.
 * @returns Classification result with risk level, category, and diagnostic warning.
 */
export function classifyPathSensitivity(candidatePath: string): PathSensitivityClassification {
  if (!candidatePath || candidatePath.trim().length === 0) {
    return {
      isSensitive: false,
      riskLevel: ApprovalRiskLevel.SAFE,
      category: "workspace",
    };
  }

  // Normalize path and expand home directory shorthand
  const expanded = expandUserHome(candidatePath.trim());
  const normalized = path.normalize(expanded);

  // 1. Check for critical security credentials (SSH keys, cloud configs, /etc)
  for (const pattern of CRITICAL_CREDENTIAL_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSensitive: true,
        riskLevel: ApprovalRiskLevel.CRITICAL,
        category: "credentials",
        warning: `CRITICAL RISK: Target path "${path.basename(normalized)}" contains private credentials, keys, or system-protected files.`,
      };
    }
  }

  // 2. Check for environment secrets, auth tokens, or cloud service account keys
  for (const pattern of SECRET_CONFIG_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSensitive: true,
        riskLevel: ApprovalRiskLevel.CAUTION,
        category: "secrets",
        warning: `SENSITIVE RISK: Target path "${path.basename(normalized)}" may expose API keys, environment secrets, or database credentials.`,
      };
    }
  }

  // 3. Path does not match any recognized sensitive signatures
  return {
    isSensitive: false,
    riskLevel: ApprovalRiskLevel.SAFE,
    category: "workspace",
  };
}
