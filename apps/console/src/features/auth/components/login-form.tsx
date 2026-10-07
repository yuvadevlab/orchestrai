"use client";

/**
 * @file apps/console/src/features/auth/components/login-form.tsx
 * @description Theme-compliant login form for authentication with email and password.
 */

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button, Input, toast } from "@yuva-devlab/ui";
import { formatApiError } from "@/lib/error-utils";
import { UI_COPY } from "@/lib/ui-copy";
import { useLoginMutation } from "../api/use-auth-mutations";
import type { LoginFormValues } from "../types";

/**
 * Clean login form component using platform theme variables.
 */
export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const loginMutation = useLoginMutation();

  const [form, setForm] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  /**
   * Dispatches login request and redirects upon success.
   */
  const handleSubmit = async (e: React.SubmitEvent): Promise<void> => {
    e.preventDefault();

    const loginPromise = loginMutation.mutateAsync({
      email: form.email,
      password: form.password,
    });

    toast.promise(loginPromise, {
      loading: UI_COPY.AUTH.LOGIN.TOAST_LOADING,
      success: UI_COPY.AUTH.LOGIN.TOAST_SUCCESS,
      error: (err) => formatApiError(err, UI_COPY.AUTH.LOGIN.TOAST_ERROR),
    });

    try {
      await loginPromise;
      router.push(redirectTarget);
      router.refresh();
    } catch {
      // API error feedback is displayed via toast notification
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-foreground block text-xs font-medium">
          {UI_COPY.AUTH.LOGIN.EMAIL_LABEL}
        </label>
        <Input
          type="email"
          placeholder={UI_COPY.AUTH.LOGIN.EMAIL_PLACEHOLDER}
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-background text-foreground h-9 text-xs"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-foreground block text-xs font-medium">
            {UI_COPY.AUTH.LOGIN.PASSWORD_LABEL}
          </label>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-primary text-[11px] transition-colors"
          >
            {UI_COPY.AUTH.LOGIN.FORGOT_PASSWORD}
          </Link>
        </div>
        <Input
          type="password"
          placeholder={UI_COPY.AUTH.LOGIN.PASSWORD_PLACEHOLDER}
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-background text-foreground h-9 text-xs"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loginMutation.isPending}
        variant="default"
        className="w-full font-medium"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            <span>{UI_COPY.AUTH.LOGIN.SIGNING_IN}</span>
          </>
        ) : (
          <span>{UI_COPY.AUTH.LOGIN.SIGN_IN_BUTTON}</span>
        )}
      </Button>
    </form>
  );
}
