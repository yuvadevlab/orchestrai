/**
 * @file apps/console/src/features/auth/types.ts
 * @description Types and interfaces for authentication flows and validation states.
 * @author yuva.devlab@gmail.com
 * @module @orchestrai/console/features/auth
 */

export interface AuthFormState {
  isLoading: boolean;
  error: string | null;
  successMessage?: string | null;
}
