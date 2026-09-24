"use client";

/**
 * @file form-dialog-field.tsx
 * @description Design system FormDialogField component rendering validated form inputs.
 * Supports text, textarea, number, and rich select controls with option descriptions.
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

/** Option specification for select fields. */
export interface FormFieldOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

/** Configuration for a form field rendered inside FormDialog. */
export interface FormFieldConfig {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "multiselect";
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  defaultValue?: string;
  colSpan?: 1 | 2;
  helperText?: string;
}

export interface FormDialogFieldProps {
  field: FormFieldConfig;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
}

/**
 * Design System Form Dialog Field component.
 * Renders validated inputs, textareas, rich select controls, or multiselect pill pickers.
 */
export function FormDialogField({
  field,
  value,
  onChange,
  error,
}: FormDialogFieldProps): React.JSX.Element {
  const { name, label, type = "text", placeholder, required, options, helperText, colSpan } = field;

  // Selected value fallback
  const selectedValue = value || (options?.[0]?.value ?? "");

  return (
    <div className={`space-y-1.5 ${colSpan === 2 ? "sm:col-span-2" : "sm:col-span-1"}`}>
      <Label htmlFor={name} className="text-foreground block text-xs font-semibold tracking-wide">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e): void => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="bg-background/70 border-border/80 focus-visible:ring-primary min-h-24 resize-y text-xs"
        />
      ) : type === "select" ? (
        <Select value={selectedValue} onValueChange={(val): void => onChange(name, val)}>
          <SelectTrigger className="bg-background/70 border-border/80 h-9 w-full min-w-0 text-xs">
            <SelectValue placeholder={placeholder || "Select option..."} className="truncate" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-foreground max-h-60 w-(--radix-select-trigger-width) min-w-50 overflow-y-auto rounded-md p-1 shadow-xl">
            {options?.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer px-2.5 py-1.5 text-xs font-medium"
              >
                <span className="truncate">{opt.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "multiselect" ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {options && options.length > 0 ? (
            options.map((opt) => {
              const selectedList = value
                ? value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];
              const isSelected = selectedList.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(): void => {
                    const next = isSelected
                      ? selectedList.filter((s) => s !== opt.value)
                      : [...selectedList, opt.value];
                    onChange(name, next.join(", "));
                  }}
                  className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary/50 bg-primary/15 text-primary shadow-xs"
                      : "border-border/70 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {opt.label}
                </button>
              );
            })
          ) : (
            <span className="text-muted-foreground text-xs italic">
              No options available in database
            </span>
          )}
        </div>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e): void => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="bg-background/70 border-border/80 h-9 text-xs"
        />
      )}

      {helperText ? (
        <p className="text-muted-foreground text-[11px] leading-tight">{helperText}</p>
      ) : null}
      {error ? <p className="text-destructive text-[11px]">{error}</p> : null}
    </div>
  );
}
