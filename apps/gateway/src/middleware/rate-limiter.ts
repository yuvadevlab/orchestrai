/**
 * @file apps/gateway/src/middleware/rate-limiter.ts
 * @description In-memory sliding window rate limiter enforcing per-IP and per-key request quotas.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * Sliding-window rate limiter preventing API abuse and resource saturation.
 */
export class RateLimiter {
  private readonly clients = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 120) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodically sweep expired records to bound memory footprint
    setInterval(() => this.pruneStale(), 60000).unref();
  }

  /**
   * Evaluates request against rate limits and sets RFC rate limit headers.
   *
   * @param req - Inbound gateway request
   * @param res - Outbound gateway response
   * @returns True if request is allowed; false if throttled with 429
   */
  check(req: GatewayRequest, res: GatewayResponse): boolean {
    const key = req.context.apiKeyId || req.context.clientIp;
    const now = Date.now();

    let record = this.clients.get(key);
    // Initialize or reset record if window expired
    if (!record || now >= record.resetAt) {
      record = {
        count: 0,
        resetAt: now + this.windowMs,
      };
      this.clients.set(key, record);
    }

    record.count++;
    const remaining = Math.max(0, this.maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader("X-RateLimit-Limit", this.maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", resetSeconds.toString());

    // Check if limit exceeded
    if (record.count > this.maxRequests) {
      res.statusCode = 429;
      res.setHeader("Retry-After", resetSeconds.toString());
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Rate limit quota of ${this.maxRequests} requests per ${this.windowMs / 1000}s exceeded.`,
            retryAfterSeconds: resetSeconds,
            requestId: req.context.requestId,
          },
        }),
      );
      return false;
    }

    return true;
  }

  /**
   * Sweeps expired records from internal map.
   */
  private pruneStale(): void {
    const now = Date.now();
    for (const [key, record] of this.clients.entries()) {
      if (now >= record.resetAt) {
        this.clients.delete(key);
      }
    }
  }
}
