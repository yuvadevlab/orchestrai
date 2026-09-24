"use client";

/**
 * @file apps/console/src/lib/query-provider.tsx
 * @description Centralized TanStack Query client provider managing server state caching and garbage collection.
 * @module apps/console/lib
 */

import React, { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Factory creating an enterprise-configured QueryClient instance.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns the singleton QueryClient instance in the browser.
 */
export function getQueryClient(): QueryClient {
  // If running on server, always create a fresh QueryClient instance
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  // If running on browser, preserve single client across re-renders
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * Universal TanStack Query Provider wrapping application tree.
 */
export function AppQueryProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [queryClient] = useState(() => getQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
