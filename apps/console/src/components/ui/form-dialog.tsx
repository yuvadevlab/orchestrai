"use client";

/**
 * @file form-dialog.tsx
 * @description Design System FormDialog component powered by @yuva-devlab/ui Dialog primitives.
 * Features accessible focus management, portal mounting, fixed header, scrollable body, and pinned action footer.
 * @module apps/console/components/ui
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Button,
} from "@yuva-devlab/ui";
import { Loader2 } from "lucide-react";
import { FormDialogField, type FormFieldConfig } from "./form-dialog-field";

export type { FormFieldConfig };

/** Supported maximum width constraints for modal presentation. */
export type FormDialogMaxWidth = "md" | "lg" | "xl" | "2xl";

export interface FormDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  submitText?: string;
  maxWidth?: FormDialogMaxWidth;
  onClose: () => void;
  onSubmit: (formData: Record<string, string>) => Promise<void> | void;
}

/**
 * Design System Form Dialog modal component using @yuva-devlab/ui Dialog primitives.
 * Carefully balances scrollable content, fixed action controls, and responsive grid layouts.
 */
export function FormDialog({
  isOpen,
  title,
  description,
  fields,
  submitText = "Save",
  maxWidth = "xl",
  onClose,
  onSubmit,
}: FormDialogProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    }
  }, [isOpen, fields]);

  const handleFieldChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.SubmitEvent): Promise<void> => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Validate required fields
    fields.forEach((f) => {
      if (f.required && !formData[f.name]?.trim()) {
        errors[f.name] = `${f.label} is required.`;
      }
    });

    // Guard: Prevent submit if validation errors exist
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Action feedback (error/success) is communicated via toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size={maxWidth}>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-display">{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <DialogBody className="overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
              {fields.map((field) => (
                <FormDialogField
                  key={field.name}
                  field={field}
                  value={formData[field.name] ?? ""}
                  onChange={handleFieldChange}
                  error={fieldErrors[field.name]}
                />
              ))}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
