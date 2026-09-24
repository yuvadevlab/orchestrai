"use client";

/**
 * @file form-dialog.tsx
 * @description Design System FormDialog component for modal forms matching FinAI standards.
 * Features a fixed header, scrollable body with 2-column responsive grid, and pinned action footer.
 * @module apps/console/components/ui
 */

import React, { useState, useEffect } from "react";
import { Button } from "@yuva-devlab/ui";
import { X, Loader2 } from "lucide-react";
import { FormDialogField, type FormFieldConfig } from "./form-dialog-field";

export type { FormFieldConfig };

/** Supported maximum width constraints for modal presentation. */
export type FormDialogMaxWidth = "md" | "lg" | "xl" | "2xl";

const MAX_WIDTH_CLASSES: Record<FormDialogMaxWidth, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

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
 * Design System Form Dialog modal component.
 * Carefully balances scrollable content, fixed action controls, and 2-column layouts.
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

  if (!isOpen) return null;

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
    <div
      className="bg-background/80 animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className={`border-border bg-card relative flex w-full flex-col ${MAX_WIDTH_CLASSES[maxWidth]} max-h-[min(90vh,760px)] overflow-hidden rounded-md border shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="border-border/70 bg-card flex shrink-0 items-start justify-between border-b px-6 py-4">
          <div className="pr-4">
            <h2 className="font-display text-foreground text-base font-bold tracking-tight">
              {title}
            </h2>
            {description ? (
              <p className="text-muted-foreground mt-0.5 text-xs leading-normal">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="hover:bg-accent text-muted-foreground hover:text-foreground size-7 shrink-0 cursor-pointer rounded-md"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Form with Scrollable Body and Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Scrollable Form Fields Grid */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
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
          </div>

          {/* Pinned Action Footer */}
          <div className="border-border/70 bg-card/95 flex shrink-0 items-center justify-end gap-2.5 border-t px-6 py-3.5 backdrop-blur-xs">
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
          </div>
        </form>
      </div>
    </div>
  );
}
