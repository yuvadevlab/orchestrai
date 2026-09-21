"use client";

/**
 * @file form-dialog.tsx
 * @description Design System FormDialog component for modal forms matching FinAI standards.
 * @module apps/console/components/ui
 */

import React, { useState, useEffect } from "react";
import { Button } from "@yuva-devlab/ui";
import { X, Check, Loader2 } from "lucide-react";
import { FormDialogField, type FormFieldConfig } from "./form-dialog-field";

export type { FormFieldConfig };

export interface FormDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  submitText?: string;
  onClose: () => void;
  onSubmit: (formData: Record<string, string>) => Promise<void> | void;
}

/**
 * Design System Form Dialog modal component.
 */
export function FormDialog({
  isOpen,
  title,
  description,
  fields,
  submitText = "Save",
  onClose,
  onSubmit,
}: FormDialogProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.defaultValue) initial[f.name] = f.defaultValue;
        else if (f.type === "select" && f.options?.[0]) initial[f.name] = f.options[0].value;
        else initial[f.name] = "";
      });
      setFormData(initial);
      setFieldErrors({});
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, fields]);

  if (!isOpen) return null;

  const handleFieldChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);
    const errors: Record<string, string> = {};

    fields.forEach((f) => {
      if (f.required && !formData[f.name]?.trim()) {
        errors[f.name] = `${f.label} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccessMsg("Submitted successfully.");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to process form request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="border-border bg-card w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="size-7 cursor-pointer rounded-md"
          >
            <X className="size-4" />
          </Button>
        </div>

        {errorMsg ? (
          <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-2.5 font-mono text-xs">
            {errorMsg}
          </div>
        ) : null}

        {successMsg ? (
          <div className="border-primary/40 bg-primary/10 text-primary flex items-center gap-2 rounded-md border p-2.5 font-mono text-xs">
            <Check className="size-4" />
            <span>{successMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <FormDialogField
              key={field.name}
              field={field}
              value={formData[field.name] ?? ""}
              onChange={handleFieldChange}
              error={fieldErrors[field.name]}
            />
          ))}

          <div className="border-border flex items-center justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 cursor-pointer font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="h-8 cursor-pointer gap-1.5 font-mono text-xs font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{submitText}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
