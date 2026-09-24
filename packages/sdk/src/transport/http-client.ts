/**
 * @file packages/sdk/src/transport/http-client.ts
 * @description Resilient HTTP client managing HMAC signing, idempotency, retries, and streaming.
 */

import { signRequest } from "@/security";
import type { OrchestrAIClientOptions } from "@/types";
import { RetryPolicy } from "./retry-policy";
import { resolveIdempotencyKey } from "./idempotency";
import { mapHttpError } from "./error-mapper";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  timeoutMs?: number;
}

/**
 * Universal HTTP transport connecting to OrchestrAI Gateway and Realtime services.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly tenantId?: string;
  private readonly retryPolicy: RetryPolicy;

  constructor(private readonly options: OrchestrAIClientOptions = {}) {
    this.baseUrl = (options.baseUrl || "http://localhost:8000").replace(/\/$/, "");
    this.tenantId = options.tenantId;
    this.retryPolicy = new RetryPolicy({ maxRetries: options.maxRetries ?? 3 });
  }

  /**
   * Executes a typed JSON request with automated retries and HMAC authentication.
   */
  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(this.baseUrl, path, options.params);
    const method = options.method || "GET";
    const bodyStr = options.body ? JSON.stringify(options.body) : "";

    let attempt = 0;
    while (true) {
      const abortCtrl = new AbortController();
      const timeout = setTimeout(
        () => abortCtrl.abort(),
        options.timeoutMs ?? this.options.timeoutMs ?? 30000,
      );

      try {
        const headers = await this.prepareHeaders(method, path, bodyStr, options);
        const res = await fetch(url, {
          method,
          headers,
          body: ["POST", "PUT", "PATCH"].includes(method) ? bodyStr : undefined,
          signal: abortCtrl.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          if (
            attempt < this.retryPolicy.maximumRetries &&
            this.retryPolicy.isRetriable(res.status)
          ) {
            const retryHeader = res.headers.get("retry-after");
            const retrySec = retryHeader ? parseInt(retryHeader, 10) : undefined;
            await new Promise((r) => setTimeout(r, this.retryPolicy.getDelay(attempt++, retrySec)));
            continue;
          }
          throw mapHttpError(res.status, errorBody, res.headers);
        }

        if (res.status === 204) {
          return undefined as T;
        }

        return (await res.json()) as T;
      } catch (err) {
        clearTimeout(timeout);
        if (
          attempt < this.retryPolicy.maximumRetries &&
          this.retryPolicy.isRetriable(undefined, err)
        ) {
          await new Promise((r) => setTimeout(r, this.retryPolicy.getDelay(attempt++)));
          continue;
        }
        throw err;
      }
    }
  }

  /**
   * Opens a streaming connection and returns raw ReadableStream for SSE consumption.
   */
  public async requestStream(
    urlOrPath: string,
    options: RequestOptions = {},
  ): Promise<ReadableStream<Uint8Array>> {
    const url = urlOrPath.startsWith("http")
      ? urlOrPath
      : this.buildUrl(
          this.options.realtimeUrl || "http://localhost:8001",
          urlOrPath,
          options.params,
        );

    const headers = await this.prepareHeaders("GET", urlOrPath, "", options);
    headers["Accept"] = "text/event-stream";

    const res = await fetch(url, { method: "GET", headers });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw mapHttpError(res.status, errJson, res.headers);
    }

    if (!res.body) {
      throw new Error("Received empty response body on streaming endpoint");
    }

    return res.body;
  }

  private async prepareHeaders(
    method: string,
    path: string,
    body: string,
    options: RequestOptions,
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.tenantId ? { "X-Tenant-ID": this.tenantId } : {}),
      ...this.options.customHeaders,
      ...options.headers,
    };

    if (["POST", "PUT", "DELETE"].includes(method)) {
      headers["Idempotency-Key"] = resolveIdempotencyKey(options.idempotencyKey);
    }

    if (this.options.clientId && this.options.clientSecret) {
      const signed = await signRequest(
        method,
        path,
        body,
        this.options.clientId,
        this.options.clientSecret,
      );
      Object.assign(headers, signed);
    } else if (this.options.apiKey) {
      headers["X-API-Key"] = this.options.apiKey;
    } else if (this.options.token) {
      headers["Authorization"] = `Bearer ${this.options.token}`;
    }

    return headers;
  }

  private buildUrl(base: string, path: string, params?: Record<string, unknown>): string {
    const url = new URL(path.replace(/^\//, ""), `${base}/`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) {
          url.searchParams.append(k, String(v));
        }
      }
    }
    return url.toString();
  }
}
