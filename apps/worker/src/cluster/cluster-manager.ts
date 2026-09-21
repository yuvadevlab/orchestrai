/**
 * @file cluster-manager.ts
 * @description Worker cluster manager managing node heartbeats and partition rebalancing.
 * @module apps/worker/cluster
 */

/** Descriptor tracking an active worker cluster node */
export interface ClusterNodeInfo {
  readonly workerId: string;
  readonly hostname: string;
  readonly concurrency: number;
  readonly lastHeartbeatAt: number;
}

/**
 * Manages distributed worker cluster state, node discovery, and task partition assignment.
 */
export class ClusterManager {
  private readonly nodes = new Map<string, ClusterNodeInfo>();

  /**
   * @param localWorkerId - Unique identifier of local worker node
   * @param heartbeatIntervalMs - Heartbeat frequency in milliseconds (default: 5s)
   */
  constructor(
    private readonly localWorkerId: string,
    private readonly heartbeatIntervalMs: number = 5_000,
  ) {}

  /**
   * Registers or updates heartbeat for a worker cluster node.
   *
   * @param node - ClusterNodeInfo payload
   */
  public registerHeartbeat(node: ClusterNodeInfo): void {
    this.nodes.set(node.workerId, node);
  }

  /**
   * Purges dead nodes that have missed heartbeat threshold (3x interval).
   *
   * @returns Array of dead worker IDs purged from cluster
   */
  public purgeStaleNodes(): string[] {
    const now = Date.now();
    const deadThreshold = this.heartbeatIntervalMs * 3;
    const purged: string[] = [];

    for (const [id, info] of this.nodes.entries()) {
      if (now - info.lastHeartbeatAt > deadThreshold && id !== this.localWorkerId) {
        this.nodes.delete(id);
        purged.push(id);
      }
    }

    return purged;
  }

  /**
   * Returns list of currently active worker cluster nodes.
   */
  public get activeNodes(): ClusterNodeInfo[] {
    return Array.from(this.nodes.values());
  }
}
