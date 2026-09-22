"use client";

/**
 * @file form-dialog-field.tsx
 * @description Design system FormDialogField component rendering validated form inputs.
 * @module apps/console/components/ui
 */

import React from "react";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@yuva-devlab/ui";

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
 * Renders validated inputs, textareas, or design-system select controls.
 */
export function FormDialogField({
  field,
  value,
  onChange,
  error,
}: FormDialogFieldProps): React.JSX.Element {
  const { name, label, type = "text", placeholder, required, options } = field;

  // Compute selected value fallback
  const selectedValue = value || (options?.[0]?.value ?? "");

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={name}
        className="text-muted-foreground block font-mono text-[11px] font-semibold tracking-wider uppercase"
      >
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>

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
        <Select value={selectedValue} onValueChange={(val): void => onChange(name, val)}>
          <SelectTrigger className="bg-background/70 border-border/80 h-8 font-mono text-xs">
            <SelectValue placeholder={placeholder || "Select option..."} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-foreground font-mono text-xs">
            {options?.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer font-mono text-xs"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
