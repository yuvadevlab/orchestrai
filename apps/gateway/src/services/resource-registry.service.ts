/**
 * @file apps/gateway/src/services/resource-registry.service.ts
 * @description Generic Resource Registry service for canonical URI normalization and resource entity indexing.
 * @module apps/gateway/services
 */

import path from "node:path";
import fs from "node:fs";
import { getPrismaClient, type Resource } from "@orchestrai/database";
import { ResourceType } from "@orchestrai/shared-types";
import { expandUserHome } from "@orchestrai/tools";
import { isResourceContained } from "@orchestrai/core";
import { findNearestProjectRoot } from "./permission-storage";

/**
 * Service managing platform resource registration, URI normalization, and containment verification.
 */
export class ResourceRegistryService {
  /**
   * Translates a tool argument or raw target into a canonical platform resource URI.
   *
   * @param target - Target argument string (e.g. file path, shell command, URL, repo slug)
   * @param toolName - Executing tool identifier
   * @param workspaceRoot - Primary workspace root for resolving relative paths
   * @returns Normalized URI, ResourceType, and human-readable name
   */
  public canonicalizeTarget(
    target: string,
    toolName: string,
    workspaceRoot: string,
  ): { uri: string; type: ResourceType; name: string } {
    // 1. Shell commands execute against system shell service
    if (toolName === "bash") {
      const commandStr = target || "command";
      return {
        uri: `service://system/bash?cmd=${encodeURIComponent(commandStr.slice(0, 120))}`,
        type: ResourceType.INTERNAL_SERVICE,
        name: `Shell Command: ${commandStr.slice(0, 40)}`,
      };
    }

    // 2. HTTP / API integrations
    if (target.startsWith("http://") || target.startsWith("https://")) {
      try {
        const parsed = new URL(target);
        return {
          uri: `api://${parsed.host}${parsed.pathname}`,
          type: ResourceType.API,
          name: `API Endpoint: ${parsed.host}`,
        };
      } catch {
        return {
          uri: `api://${target}`,
          type: ResourceType.API,
          name: `API Endpoint: ${target}`,
        };
      }
    }

    // 3. Database connection / queries
    if (target.startsWith("db://") || target.startsWith("postgres://")) {
      return {
        uri: target.startsWith("db://") ? target : target.replace(/^postgres:\/\//, "db://"),
        type: ResourceType.DATABASE,
        name: "Database Query Resource",
      };
    }

    // 4. Git repository identifiers
    if (target.startsWith("repo://") || target.startsWith("git@")) {
      const repoUri = target.startsWith("repo://") ? target : `repo://${target}`;
      return {
        uri: repoUri,
        type: ResourceType.REPOSITORY,
        name: `Repository: ${path.basename(target)}`,
      };
    }

    // 5. Filesystem paths
    const expanded = expandUserHome(target);
    let resolved = path.isAbsolute(expanded)
      ? path.resolve(expanded)
      : path.resolve(workspaceRoot, expanded);

    // If relative path does not exist in workspaceRoot, check sibling directory
    if (!path.isAbsolute(expanded) && !fs.existsSync(resolved)) {
      const siblingCandidate = path.resolve(path.dirname(workspaceRoot), expanded);
      if (fs.existsSync(siblingCandidate)) {
        resolved = siblingCandidate;
      }
    }

    const isDir = fs.existsSync(resolved) ? fs.statSync(resolved).isDirectory() : false;
    return {
      uri: `file://${resolved}`,
      type: isDir ? ResourceType.DIRECTORY : ResourceType.FILE,
      name: path.basename(resolved) || "Root Directory",
    };
  }

  /**
   * Retrieves or lazily creates an entry in the platform Resource registry.
   *
   * @param canonicalUri - Canonical URI identifier
   * @param type - Resource taxonomy classification
   * @param name - Display label
   * @param tenantId - Optional tenant owner
   * @returns Persisted Resource record
   */
  public async getOrCreateResource(
    canonicalUri: string,
    type: ResourceType,
    name: string,
    tenantId?: string,
  ): Promise<Resource> {
    const prisma = getPrismaClient();

    // Find existing resource by unique canonical URI
    const existing = await prisma.resource.findUnique({
      where: { canonicalUri },
    });

    if (existing) {
      return existing;
    }

    // Upsert resource record if newly encountered
    return prisma.resource.create({
      data: {
        canonicalUri,
        type,
        name,
        tenantId: tenantId ?? null,
      },
    });
  }

  /**
   * Determines if a child resource URI is contained within an authorized parent URI.
   *
   * @param parentUri - Authorized base URI
   * @param childUri - Target operation URI
   * @returns True if childUri is equal to or sub-resource of parentUri
   */
  public checkContainment(parentUri: string, childUri: string): boolean {
    return isResourceContained(parentUri, childUri);
  }

  /**
   * Computes the nearest containing directory or project URI for suggested clearance elevation.
   *
   * @param fileUri - Target file URI
   * @returns Nearest parent project or directory URI
   */
  public getSuggestedElevationUri(fileUri: string): string {
    if (!fileUri.startsWith("file://")) {
      return fileUri;
    }
    const rawPath = fileUri.replace(/^file:\/\//, "");
    const nearestProject = findNearestProjectRoot(rawPath);
    return `file://${nearestProject}`;
  }
}

export const resourceRegistryService = new ResourceRegistryService();
