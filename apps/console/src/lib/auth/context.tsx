"use client";

/**
 * @file apps/console/src/lib/auth/context.tsx
 * @description Centralized React authentication provider and state manager with cross-tab reactive synchronization.
 * @module apps/console/lib/auth
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
import { toast } from "@orchestrai/ui";
import { DevLabAuthProvider } from "@yuva-devlab/auth-client";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/routes";
import { isJwtExpired } from "@/lib/jwt";
import { UI_COPY } from "@/lib/ui-copy";
import {
  getStoredSession,
  clearSession,
  apiFetchSession,
  type AuthSession,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
  type ForgotPasswordPayload,
} from "./client";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload?: LoginPayload) => Promise<void>;
  signup: (payload?: SignupPayload) => Promise<void>;
  logout: () => void;
  forgotPassword: (payload?: ForgotPasswordPayload) => Promise<{ message: string }>;
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
      if (isJwtExpired(initialSession.token)) {
        clearSession();
        setSession(null);
        setIsLoading(false);
        return;
      }

      setSession(initialSession);
      setIsLoading(false);

      // Validate token with Gateway in background without clearing session on network error
      apiFetchSession(initialSession.token)
        .then((freshUser) => {
          setSession((prev) => (prev ? { ...prev, user: freshUser } : null));
        })
        .catch((err) => {
          if (err instanceof Error && err.message.toLowerCase().includes("unauthorized")) {
            clearSession();
            queryClient.clear();
            setSession(null);
          }
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

  const login = async (): Promise<void> => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.LOGIN({
        redirectUrl: window.location.origin,
      });
    }
  };

  const signup = async (): Promise<void> => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.REGISTER();
    }
  };

  const logout = (): void => {
    clearSession();
    queryClient.clear();
    setSession(null);
    toast.success(UI_COPY.AUTH.LOGOUT.TOAST_SUCCESS);
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.LOGIN({
        redirectUrl: window.location.origin,
        prompt: "login",
      });
    }
  };

  const forgotPassword = async (): Promise<{ message: string }> => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.FORGOT_PASSWORD();
    }
    return { message: "Redirecting to DevLab Password Recovery" };
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

  return (
    <DevLabAuthProvider
      appId="orchestrai"
      gatewayUrl={process.env.NEXT_PUBLIC_DEVLAB_PORTAL_API_URL}
      portalUrl={process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL}
    >
      <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    </DevLabAuthProvider>
  );
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
