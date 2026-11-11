"use client";

/**
 * @file form-dialog.tsx
 * @description Design System FormDialog component powered by @yuva-devlab/ui Dialog primitives.
 * Features accessible focus management, portal mounting, fixed header, scrollable body, and pinned action footer.
 * @module apps/console/components/ui
 * @author yuva.devlab@gmail.com
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
import { COMMON_COPY } from "../copy/common";
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
  columns?: 1 | 2;
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
  submitText = COMMON_COPY.ACTIONS.DEFAULT_SUBMIT,
  maxWidth = "xl",
  columns = 2,
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
        errors[f.name] = COMMON_COPY.FORM.REQUIRED_MESSAGE(f.label);
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
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            minHeight: 0,
            flex: "1 1 0%",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-display, sans-serif)" }}>
              {title}
            </DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <DialogBody style={{ overflowY: "auto", padding: "1rem 1.5rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: columns === 1 ? "1fr" : "repeat(auto-fit, minmax(14rem, 1fr))",
                gap: "0.875rem 1rem",
              }}
            >
              {fields.map((field) => (
                <FormDialogField
                  key={field.name}
                  field={columns === 1 ? { ...field, colSpan: 1 } : field}
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
              style={{ height: "2rem", cursor: "pointer", fontSize: "0.75rem" }}
            >
              {COMMON_COPY.ACTIONS.CANCEL}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              style={{
                height: "2rem",
                cursor: "pointer",
                display: "inline-flex",
                gap: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    style={{ width: "0.875rem", height: "0.875rem" }}
                    className="orch-animate-spin"
                  />
                  <span>{COMMON_COPY.ACTIONS.SAVING}</span>
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
