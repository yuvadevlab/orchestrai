"use client";

/**
 * @file form-dialog-field.tsx
 * @description Design system FormDialogField component rendering validated form inputs.
 * @module apps/console/components/ui
 */

import React from "react";
import { Input, Textarea } from "@yuva-devlab/ui";

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface FormDialogFieldProps {
  field: FormFieldConfig;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
}

/**
 * Design System Form Dialog Field component.
 */
export function FormDialogField({
  field,
  value,
  onChange,
  error,
}: FormDialogFieldProps): React.JSX.Element {
  const { name, label, type = "text", placeholder, required, options } = field;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="text-muted-foreground block font-mono text-[11px] font-semibold tracking-wider uppercase"
      >
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e): void => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="bg-background/70 border-border/80 focus-visible:ring-primary min-h-20 font-mono text-xs"
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          value={value || (options?.[0]?.value ?? "")}
          onChange={(e): void => onChange(name, e.target.value)}
          className="border-border bg-background/70 text-foreground focus-visible:ring-primary w-full cursor-pointer rounded-md border px-3 py-1.5 font-mono text-xs outline-none focus:ring-2"
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e): void => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="bg-background/70 border-border/80 h-8 font-mono text-xs"
        />
      )}

      {error ? <p className="text-destructive font-mono text-[10px]">{error}</p> : null}
    </div>
  );
}
