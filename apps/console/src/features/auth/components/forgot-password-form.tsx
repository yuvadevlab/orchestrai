"use client";

/**
 * @file apps/console/src/features/auth/components/forgot-password-form.tsx
 * @description Theme-compliant recovery form for resetting credentials.
 */

import React, { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button, Input, toast } from "@yuva-devlab/ui";
import { formatApiError } from "@/lib/error-utils";
import { UI_COPY } from "@/lib/ui-copy";
import { useForgotPasswordMutation } from "../api/use-auth-mutations";
import type { ForgotPasswordFormValues } from "../types";

/**
 * Clean forgot password form component using platform theme variables.
 */
export function ForgotPasswordForm(): React.JSX.Element {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [form, setForm] = useState<ForgotPasswordFormValues>({ email: "" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Dispatches password recovery request to Gateway.
   */
  const handleSubmit = async (e: React.SubmitEvent): Promise<void> => {
    e.preventDefault();

    const forgotPromise = forgotPasswordMutation.mutateAsync({ email: form.email });

    toast.promise(forgotPromise, {
      loading: UI_COPY.AUTH.FORGOT_PASSWORD.TOAST_LOADING,
      success: UI_COPY.AUTH.FORGOT_PASSWORD.TOAST_SUCCESS,
      error: (err) => formatApiError(err, UI_COPY.AUTH.FORGOT_PASSWORD.TOAST_ERROR),
    });

    try {
      const res = await forgotPromise;
      setSuccessMessage(res.message);
    } catch {
      // API error feedback is displayed via toast notification
    }
  };

  if (successMessage) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-primary/10 border-primary/30 text-foreground flex flex-col items-center justify-center rounded-md border p-4 text-xs">
          <CheckCircle2 className="text-primary mb-2 size-5" />
          <p className="text-muted-foreground">{successMessage}</p>
        </div>

        <Link
          href="/login"
          className="text-primary block text-xs font-medium transition-colors hover:underline"
        >
          {UI_COPY.AUTH.FORGOT_PASSWORD.BACK_TO_LOGIN}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-foreground block text-xs font-medium">
          {UI_COPY.AUTH.FORGOT_PASSWORD.EMAIL_LABEL}
        </label>
        <Input
          type="email"
          placeholder={UI_COPY.AUTH.FORGOT_PASSWORD.EMAIL_PLACEHOLDER}
          required
          value={form.email}
          onChange={(e) => setForm({ email: e.target.value })}
          className="bg-background text-foreground h-9 text-xs"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={forgotPasswordMutation.isPending}
        variant="default"
        className="w-full font-medium"
      >
        {forgotPasswordMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            <span>{UI_COPY.AUTH.FORGOT_PASSWORD.SUBMITTING}</span>
          </>
        ) : (
          <span>{UI_COPY.AUTH.FORGOT_PASSWORD.SUBMIT_BUTTON}</span>
        )}
      </Button>
    </form>
  );
}
