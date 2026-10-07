/**
 * @file apps/gateway/src/modules/harness/harness-skill-registry.ts
 * @description In-memory registry and query service for discovered workspace skills and modular rules.
 * @module apps/gateway/modules/harness
 */

import type {
  WorkspaceSkillMetadata,
  WorkspaceRuleMetadata,
  WorkspaceHarnessContext,
} from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("HarnessSkillRegistry"));

/**
 * Registry service caching and resolving workspace skills and rules.
 */
export class HarnessSkillRegistry {
  private readonly skills = new Map<string, WorkspaceSkillMetadata>();
  private readonly rules = new Map<string, WorkspaceRuleMetadata>();
  private activeWorkspaceRoot: string = "";

  /**
   * Hydrates the registry with discovered context from the workspace.
   *
   * @param context - Discovered workspace harness context
   */
  public registerContext(context: WorkspaceHarnessContext): void {
    this.activeWorkspaceRoot = context.workspaceRoot;
    this.skills.clear();
    this.rules.clear();

    for (const skill of context.skills) {
      this.skills.set(skill.name.toLowerCase(), skill);
    }

    for (const rule of context.rules) {
      this.rules.set(rule.name.toLowerCase(), rule);
    }

    logger.debug("Hydrated harness skill registry", {
      skillsCount: this.skills.size,
      rulesCount: this.rules.size,
    });
  }

  /**
   * Retrieves a discovered skill by name (case-insensitive).
   *
   * @param name - Skill identifier or filename
   * @returns Discovered skill metadata or undefined
   */
  public getSkill(name: string): WorkspaceSkillMetadata | undefined {
    return this.skills.get(name.toLowerCase());
  }

  /**
   * Returns all discovered skills.
   */
  public listSkills(): readonly WorkspaceSkillMetadata[] {
    return Array.from(this.skills.values());
  }

  /**
   * Retrieves a discovered modular rule by name (case-insensitive).
   *
   * @param name - Rule name
   * @returns Discovered rule metadata or undefined
   */
  public getRule(name: string): WorkspaceRuleMetadata | undefined {
    return this.rules.get(name.toLowerCase());
  }

  /**
   * Returns all discovered modular rules.
   */
  public listRules(): readonly WorkspaceRuleMetadata[] {
    return Array.from(this.rules.values());
  }

  /**
   * Returns active workspace root directory path.
   */
  public getWorkspaceRoot(): string {
    return this.activeWorkspaceRoot;
  }
}
