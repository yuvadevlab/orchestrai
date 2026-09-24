"use client";

/**
 * @file apps/console/src/features/auth/components/forgot-password-form.tsx
 * @description Theme-compliant recovery form for resetting credentials.
 */

import React, { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@yuva-devlab/ui";
import { toast } from "sonner";
import { formatApiError } from "@/lib/error-utils";
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
      loading: "Dispatching recovery instructions...",
      success: "Recovery email dispatched successfully!",
      error: (err) => formatApiError(err, "Failed to send reset instructions. Please try again."),
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
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-foreground block text-xs font-medium">Email</label>
        <Input
          type="email"
          placeholder="name@example.com"
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
            <span>Sending instructions...</span>
          </>
        ) : (
          <span>Send Reset Instructions</span>
        )}
      </Button>
    </form>
  );
}
