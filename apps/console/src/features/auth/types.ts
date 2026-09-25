/**
 * @file apps/console/src/features/auth/types.ts
 * @description Types and interfaces for authentication forms, validation states, and auth flows.
 */

export interface AuthFormState {
  isLoading: boolean;
  error: string | null;
  successMessage?: string | null;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}
