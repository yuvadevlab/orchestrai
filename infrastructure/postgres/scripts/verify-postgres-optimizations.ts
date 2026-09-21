/**
 * @file verify-postgres-optimizations.ts
 * @description Verification script for Phase 23 PostgreSQL database migrations, query handbooks, and index definitions.
 * @module infrastructure/postgres/scripts
 */

import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Migration definition descriptor for verification tracking.
 */
export interface MigrationDescriptor {
  /** File name of the migration */
  readonly name: string;
  /** Expected key SQL concepts contained in the migration */
  readonly expectedFeatures: readonly string[];
}

/**
 * List of expected migration files in infrastructure/postgres/migrations.
 */
export const MIGRATIONS_TO_VERIFY: readonly MigrationDescriptor[] = [
  {
    name: "0001_core_entities.sql",
    expectedFeatures: ["CREATE TABLE", "tenants", "agents", "executions"],
  },
  {
    name: "0002_messages_and_tools.sql",
    expectedFeatures: ["messages", "tool_calls", "approvals"],
  },
  {
    name: "0003_checkpoints_and_outbox.sql",
    expectedFeatures: ["checkpoints", "outbox"],
  },
  {
    name: "0004_memory_and_rag.sql",
    expectedFeatures: ["memory_items", "documents", "document_chunks", "vector"],
  },
  {
    name: "0005_indexes_and_constraints.sql",
    expectedFeatures: ["idx_approvals_pending", "idx_outbox_pending_fifo", "hnsw"],
  },
  {
    name: "0006_advanced_postgresql_optimizations.sql",
    expectedFeatures: [
      "search_vector",
      "idx_document_chunks_fts",
      "orchestrai_try_advisory_lock",
      "outbox_partitioned",
      "mv_tenant_token_telemetry",
    ],
  },
];

/**
 * Lightweight standard output logger for standalone script execution without external package imports.
 *
 * @param message - Message to write to stdout
 */
function logInfo(message: string): void {
  process.stdout.write(`[PostgresVerification] ${message}\n`);
}

/**
 * Verifies that all expected migration files exist and contain required SQL patterns.
 *
 * @param migrationsDir - Absolute path to the migrations directory
 * @returns Object indicating success and total migrations verified
 */
export function verifyMigrations(migrationsDir: string): {
  readonly success: boolean;
  readonly verifiedCount: number;
} {
  // Guard clause: check if migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory does not exist: ${migrationsDir}`);
  }

  let verifiedCount = 0;

  for (const item of MIGRATIONS_TO_VERIFY) {
    const filePath = path.join(migrationsDir, item.name);

    // Verify file existence
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing expected migration file: ${item.name}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");

    // Verify each expected SQL feature keyword exists in the file content
    for (const feature of item.expectedFeatures) {
      if (!content.includes(feature)) {
        throw new Error(`Migration ${item.name} is missing expected feature keyword: "${feature}"`);
      }
    }

    verifiedCount++;
  }

  return { success: true, verifiedCount };
}

/**
 * Verifies that all query handbooks (01..10) exist in the queries directory.
 *
 * @param queriesDir - Absolute path to the queries directory
 * @returns Object indicating total query handbooks verified
 */
export function verifyQueryHandbooks(queriesDir: string): {
  readonly success: boolean;
  readonly verifiedCount: number;
} {
  // Guard clause: check if queries directory exists
  if (!fs.existsSync(queriesDir)) {
    throw new Error(`Queries directory does not exist: ${queriesDir}`);
  }

  const queryFiles = fs.readdirSync(queriesDir).filter((file) => file.endsWith(".sql"));

  // Ensure all 10 query handbooks are present
  if (queryFiles.length < 10) {
    throw new Error(`Expected at least 10 query handbooks, found ${queryFiles.length}`);
  }

  return { success: true, verifiedCount: queryFiles.length };
}

/**
 * Main execution entrypoint for verification script when invoked directly.
 */
function main(): void {
  const postgresDir = path.resolve(__dirname, "..");
  const migrationsDir = path.join(postgresDir, "migrations");
  const queriesDir = path.join(postgresDir, "queries");

  logInfo("Verifying PostgreSQL migrations...");
  const migrationResult = verifyMigrations(migrationsDir);
  logInfo(`Verified ${migrationResult.verifiedCount} migrations cleanly.`);

  logInfo("Verifying Query Handbooks...");
  const queryResult = verifyQueryHandbooks(queriesDir);
  logInfo(`Verified ${queryResult.verifiedCount} query handbooks cleanly.`);
}

// Run main if script is executed directly
if (require.main === module) {
  main();
}
