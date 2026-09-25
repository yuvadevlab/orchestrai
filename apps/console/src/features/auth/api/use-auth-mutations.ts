/**
 * @file apps/console/src/features/auth/api/use-auth-mutations.ts
 * @description Enterprise TanStack Query mutation hooks managing login, registration, and password recovery.
 * @module apps/console/features/auth/api
 */

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import type { LoginPayload, SignupPayload, ForgotPasswordPayload } from "@/lib/auth-client";

/**
 * Custom TanStack Query mutation hook for operator authentication.
 *
 * @returns TanStack Mutation result for login flow
 */
export function useLoginMutation(): UseMutationResult<void, Error, LoginPayload> {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<void> => {
      await login(payload);
    },
  });
}

/**
 * Custom TanStack Query mutation hook for new operator registration.
 *
 * @returns TanStack Mutation result for signup flow
 */
export function useSignupMutation(): UseMutationResult<void, Error, SignupPayload> {
  const { signup } = useAuth();

  return useMutation({
    mutationFn: async (payload: SignupPayload): Promise<void> => {
      await signup(payload);
    },
  });
}

/**
 * Custom TanStack Query mutation hook for password reset requests.
 *
 * @returns TanStack Mutation result for password recovery flow
 */
export function useForgotPasswordMutation(): UseMutationResult<
  { message: string },
  Error,
  ForgotPasswordPayload
> {
  const { forgotPassword } = useAuth();

  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
      return forgotPassword(payload);
    },
  });
}
