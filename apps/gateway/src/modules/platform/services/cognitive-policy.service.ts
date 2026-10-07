/**
 * @file apps/gateway/src/modules/platform/services/cognitive-policy.service.ts
 * @description Dynamic database-backed cognitive policy and living prompt service.
 * Manages thinking budgets, reasoning guidelines, and constitutional rules.
 * @module apps/gateway/modules/platform/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import { CognitivePolicySlug, SystemPromptSlug } from "@orchestrai/shared-types";

export interface CognitivePolicyRecord {
  policyId: string;
  slug: string;
  name: string;
  description: string | null;
  enableThinking: boolean;
  thinkingBudgetTokens: number;
  maxExecutionSteps: number;
  temperature: number;
  timeoutMs: number;
  thinkingGuidelines: string | null;
  isDefault: boolean;
  isEnabled: boolean;
}

/**
 * Service managing dynamic cognitive policies and living system prompt templates.
 */
export class CognitivePolicyService {
  private policyCache: Map<string, CognitivePolicyRecord> = new Map();
  private promptCache: Map<string, string> = new Map();
  private lastFetchedAt: number = 0;
  private readonly CACHE_TTL_MS = 15_000;

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Retrieves a cognitive policy by canonical slug.
   *
   * @param slug - Canonical policy slug (e.g. CognitivePolicySlug.AUTONOMOUS_ACT)
   */
  public async getPolicy(
    slug: CognitivePolicySlug | string,
  ): Promise<CognitivePolicyRecord | null> {
    const now = Date.now();
    if (this.policyCache.has(slug) && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
      return this.policyCache.get(slug) ?? null;
    }

    try {
      const record = await this.db.cognitivePolicy.findUnique({
        where: { slug },
      });

      if (record) {
        this.policyCache.set(slug, record as CognitivePolicyRecord);
        this.lastFetchedAt = now;
        return record as CognitivePolicyRecord;
      }
    } catch {
      // Database read fallback
    }

    return null;
  }

  /**
   * Retrieves living system prompt template content by canonical slug.
   *
   * @param slug - Canonical prompt slug (e.g. SystemPromptSlug.MODE_ACT)
   */
  public async getPrompt(slug: SystemPromptSlug | string): Promise<string | null> {
    const now = Date.now();
    if (this.promptCache.has(slug) && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
      return this.promptCache.get(slug) ?? null;
    }

    try {
      const record = await this.db.systemPromptTemplate.findUnique({
        where: { slug },
      });

      if (record && record.isActive) {
        this.promptCache.set(slug, record.content);
        this.lastFetchedAt = now;
        return record.content;
      }
    } catch {
      // Database read fallback
    }

    return null;
  }

  /**
   * Lists all active cognitive policies.
   */
  public async listPolicies(): Promise<CognitivePolicyRecord[]> {
    try {
      const records = await this.db.cognitivePolicy.findMany({
        where: { isEnabled: true },
        orderBy: { isDefault: "desc" },
      });
      return records as CognitivePolicyRecord[];
    } catch {
      return [];
    }
  }
}

export const cognitivePolicyService = new CognitivePolicyService();
