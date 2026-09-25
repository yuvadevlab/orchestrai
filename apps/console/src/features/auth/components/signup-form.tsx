"use client";

/**
 * @file apps/console/src/features/auth/components/signup-form.tsx
 * @description Theme-compliant signup form with name, email, password, and confirm password fields.
 */

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, Input, toast } from "@yuva-devlab/ui";
import { formatApiError } from "@/lib/error-utils";
import { useSignupMutation } from "../api/use-auth-mutations";
import { AuthErrorBanner } from "./auth-error-banner";
import type { SignupFormValues } from "../types";

/**
 * Clean signup form component capturing user display name and credentials.
 */
export function SignupForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const signupMutation = useSignupMutation();

  const [form, setForm] = useState<SignupFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Dispatches user registration and redirects upon success.
   */
  const handleSubmit = async (e: React.SubmitEvent): Promise<void> => {
    e.preventDefault();
    setValidationError(null);

    // Guard: Validate name presence
    if (!form.name.trim()) {
      setValidationError("Please enter your name");
      return;
    }

    // Guard: Validate password confirmation match
    if (form.password !== form.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setValidationError("Password must contain at least 6 characters");
      return;
    }

    const signupPromise = signupMutation.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    toast.promise(signupPromise, {
      loading: "Creating operator account...",
      success: "Account created successfully!",
      error: (err) => formatApiError(err, "Registration failed. Please try again."),
    });

    try {
      await signupPromise;
      router.push(redirectTarget);
      router.refresh();
    } catch {
      // API error feedback is displayed via toast notification
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Form Validation Feedback */}
      <AuthErrorBanner message={validationError} variant="coral" />

      {/* Name / Display Name Field */}
      <div className="space-y-1.5">
        <label className="text-foreground block text-xs font-medium">Your Name</label>
        <div className="relative">
          <Input
            type="text"
            placeholder="John Doe"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-background text-foreground h-9 text-xs"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-foreground block text-xs font-medium">Work Email</label>
        <Input
          type="email"
          placeholder="john.doe@example.com"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-background text-foreground h-9 text-xs"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label className="text-foreground block text-xs font-medium">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-background text-foreground h-9 text-xs"
        />
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <label className="text-foreground block text-xs font-medium">Confirm Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          required
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="bg-background text-foreground h-9 text-xs"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={signupMutation.isPending}
        variant="default"
        className="w-full font-medium"
      >
        {signupMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </Button>
    </form>
  );
}
