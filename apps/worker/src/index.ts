/**
 * @file apps/worker/src/index.ts
 * @description Master entry point and executable daemon for the OrchestrAI background worker.
 */

import { createLogger } from "@orchestrai/logger";
import {
  loadWorkerConfig,
  createWorkerContainer,
  registerProcessLifecycle,
  type WorkerContainer,
} from "./bootstrap";

const logger = createLogger("WorkerBootstrap");

export * from "./bootstrap";
export * from "./jobs";
export * from "./processors";
export * from "./workers";

/**
 * Boots the background worker daemon.
 *
 * @returns Initialized worker container.
 */
export async function startWorkerDaemon(): Promise<WorkerContainer> {
  // 1. Load validated configuration from environment
  const config = loadWorkerConfig();
  logger.info(`Starting OrchestrAI Worker '${config.workerId}'...`);

  // 2. Initialize service container and workers
  const container = await createWorkerContainer(config);

  // 3. Attach graceful shutdown and signal traps
  registerProcessLifecycle(container);

  // 4. Activate workers to start polling Redis queues
  container.workerManager.resumeAll();

  // 5. Print operational startup status
  const statuses = container.workerManager.getStatuses();
  logger.info(`Worker daemon running with ${container.workerManager.count} active queues:`);
  for (const s of statuses) {
    logger.info(`  - Worker '${s.name}' on queue '${s.queue}' (paused: ${s.isPaused})`);
  }

  return container;
}

// Auto-start worker when launched directly via node / ts-node / cli
const isDirectExecution =
  process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts");

if (isDirectExecution) {
  startWorkerDaemon().catch((error) => {
    logger.error("Fatal error during startup:", error);
    process.exit(1);
  });
}
