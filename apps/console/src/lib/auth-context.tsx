"use client";

/**
 * @file apps/console/src/lib/auth-context.tsx
 * @description Centralized React authentication provider and state manager with cross-tab reactive synchronization.
 * @module apps/console/lib
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@yuva-devlab/ui";
import {
  getStoredSession,
  apiLogin,
  apiSignup,
  apiForgotPassword,
  clearSession,
  apiFetchSession,
  type AuthSession,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
  type ForgotPasswordPayload,
} from "./auth-client";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const BROADCAST_CHANNEL = "orchestrai_auth_sync";

/**
 * Enterprise React Authentication Provider.
 * Hydrates active operator session, listens for cross-tab sync, and provides reactive authentication state.
 */
export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initial session hydration and validation
  useEffect(() => {
    const initialSession = getStoredSession();
    if (initialSession?.token) {
      setSession(initialSession);
      // Validate token with Gateway in background
      apiFetchSession(initialSession.token)
        .then((freshUser) => {
          setSession((prev) => (prev ? { ...prev, user: freshUser } : null));
        })
        .catch(() => {
          // Token expired or invalid
          clearSession();
          queryClient.clear();
          setSession(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Cross-tab broadcast channel synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === "AUTH_LOGIN") {
          setSession(event.data.session as AuthSession);
        } else if (event.data?.type === "AUTH_LOGOUT") {
          queryClient.clear();
          setSession(null);
          router.push("/login");
          router.refresh();
        }
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }

    return () => {
      if (channel) channel.close();
    };
  }, [router, queryClient]);

  const login = async (payload: LoginPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const newSession = await apiLogin(payload);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const newSession = await apiSignup(payload);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clearSession();
    queryClient.clear();
    setSession(null);
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  const forgotPassword = async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
    return apiForgotPassword(payload);
  };

  const contextValue: AuthContextValue = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      tenantId: session?.user?.tenantId ?? null,
      isAuthenticated: Boolean(session?.token),
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Custom React Hook consuming the centralized authentication context.
 * Throws a descriptive developer error if invoked outside of AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
