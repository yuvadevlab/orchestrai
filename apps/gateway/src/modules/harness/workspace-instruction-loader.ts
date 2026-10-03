/**
 * @file apps/gateway/src/modules/harness/workspace-instruction-loader.ts
 * @description Dynamic discovery and parser for workspace instructions (AGENTS.md, CLAUDE.md, rules, and skills).
 * Conforms to Big 3 Agent Harness standards (Claude Code, Antigravity, Copilot).
 * @module apps/gateway/modules/harness
 */

import fs from "node:fs";
import path from "node:path";
import { YAML_FRONTMATTER_REGEX, YAML_KEY_VALUE_REGEX } from "@orchestrai/regex";
import type {
  WorkspaceSkillMetadata,
  WorkspaceRuleMetadata,
  WorkspaceHarnessContext,
} from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("WorkspaceInstructionLoader"));

/**
 * Known root instruction file names checked in dependency order.
 */
const ROOT_INSTRUCTION_FILENAMES = [
  "AGENTS.md",
  "CLAUDE.md",
  ".cursorrules",
  ".github/copilot-instructions.md",
] as const;

/**
 * Parses simple YAML frontmatter key-values without external parser dependencies.
 */
function parseYamlFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const match = YAML_FRONTMATTER_REGEX.exec(content);
  if (!match || !match[1]) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: Record<string, string> = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const kvMatch = YAML_KEY_VALUE_REGEX.exec(line.trim());
    if (kvMatch && kvMatch[1]) {
      const key = kvMatch[1].trim();
      const val = (kvMatch[2] || "").trim().replace(/^["']|["']$/g, "");
      frontmatter[key] = val;
    }
  }

  const body = content.slice(match[0].length).trim();
  return { frontmatter, body };
}

/**
 * Service that discovers and parses workspace markdown rules and skills.
 */
export class WorkspaceInstructionLoader {
  /**
   * Scans a workspace root directory and returns aggregated harness context.
   *
   * @param workspaceRoot - Monorepo or project root directory path
   * @returns Discovered instructions, rules, and skills
   */
  public loadContext(workspaceRoot: string): WorkspaceHarnessContext {
    const rootInstructions = this.discoverRootInstructions(workspaceRoot);
    const rules = this.discoverRules(workspaceRoot);
    const skills = this.discoverSkills(workspaceRoot);

    logger.debug("Discovered workspace harness specifications", {
      workspaceRoot,
      rootInstructionsCount: rootInstructions.length,
      rulesCount: rules.length,
      skillsCount: skills.length,
    });

    return {
      rootInstructions,
      rules,
      skills,
      workspaceRoot,
    };
  }

  /**
   * Discovers primary workspace instruction files like AGENTS.md or CLAUDE.md.
   */
  private discoverRootInstructions(
    workspaceRoot: string,
  ): Array<{ name: string; content: string }> {
    const results: Array<{ name: string; content: string }> = [];

    for (const filename of ROOT_INSTRUCTION_FILENAMES) {
      const fullPath = path.join(workspaceRoot, filename);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          results.push({ name: filename, content: content.trim() });
        } catch (err) {
          logger.warn("Failed to read root instruction file", {
            path: fullPath,
            error: String(err),
          });
        }
      }
    }

    return results;
  }

  /**
   * Discovers modular rule files under .agents/rules/ or .cursor/rules/.
   */
  private discoverRules(workspaceRoot: string): WorkspaceRuleMetadata[] {
    const ruleDirs = [
      path.join(workspaceRoot, ".agents", "rules"),
      path.join(workspaceRoot, ".cursor", "rules"),
    ];

    const rules: WorkspaceRuleMetadata[] = [];

    for (const dir of ruleDirs) {
      if (!fs.existsSync(dir)) continue;

      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.endsWith(".md")) {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, "utf-8");
            rules.push({
              name: path.basename(file, ".md"),
              path: filePath,
              content: content.trim(),
            });
          }
        }
      } catch (err) {
        logger.warn("Failed to scan rules directory", { dir, error: String(err) });
      }
    }

    return rules;
  }

  /**
   * Discovers skills with SKILL.md under .agents/skills/ or skills/.
   */
  private discoverSkills(workspaceRoot: string): WorkspaceSkillMetadata[] {
    const skillRoots = [
      path.join(workspaceRoot, ".agents", "skills"),
      path.join(workspaceRoot, "skills"),
    ];

    const skills: WorkspaceSkillMetadata[] = [];

    for (const root of skillRoots) {
      if (!fs.existsSync(root)) continue;

      try {
        const entries = fs.readdirSync(root, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillFilePath = path.join(root, entry.name, "SKILL.md");
            if (fs.existsSync(skillFilePath)) {
              const raw = fs.readFileSync(skillFilePath, "utf-8");
              const { frontmatter, body } = parseYamlFrontmatter(raw);

              skills.push({
                name: frontmatter.name || entry.name,
                description: frontmatter.description || `Skill for ${entry.name}`,
                path: skillFilePath,
                instructions: body,
              });
            }
          }
        }
      } catch (err) {
        logger.warn("Failed to scan skills directory", { root, error: String(err) });
      }
    }

    return skills;
  }

  /**
   * Formats harness context into a markdown prompt block for model system prompts.
   *
   * @param context - Discovered harness context
   * @returns Formatted markdown block
   */
  public formatPromptContext(context: WorkspaceHarnessContext): string {
    const sections: string[] = [];

    // 1. Primary Instructions
    if (context.rootInstructions.length > 0) {
      const rootText = context.rootInstructions
        .map((r) => `### Instruction Source: ${r.name}\n${r.content}`)
        .join("\n\n");
      sections.push(`## Workspace Instructions & Operating Guidelines\n${rootText}`);
    }

    // 2. Active Modular Rules
    if (context.rules.length > 0) {
      const rulesSummary = context.rules
        .map((r) => `- **${r.name}**: ${r.content.slice(0, 150)}...`)
        .join("\n");
      sections.push(`## Active Workspace Rules\n${rulesSummary}`);
    }

    // 3. Available On-Demand Skills
    if (context.skills.length > 0) {
      const skillsSummary = context.skills
        .map((s) => `- **${s.name}**: ${s.description} (inspect with \`read_skill\`)`)
        .join("\n");
      sections.push(`## Available On-Demand Skills\n${skillsSummary}`);
    }

    return sections.join("\n\n");
  }
}
