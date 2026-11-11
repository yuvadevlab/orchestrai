"use client";

/**
 * @file form-dialog-field.tsx
 * @description Design system FormDialogField component rendering validated form inputs.
 * Supports text, textarea, number, and rich select controls with option descriptions.
 * @module apps/console/components/ui
 * @author yuva.devlab@gmail.com
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
import { COMMON_COPY } from "../copy/common";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        gridColumn: colSpan === 2 ? "span 2" : "span 1",
      }}
    >
      <Label
        htmlFor={name}
        style={{
          color: "var(--foreground)",
          display: "block",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.025em",
        }}
      >
        {label}{" "}
        {required ? (
          <span style={{ color: "var(--destructive)" }}>{COMMON_COPY.FORM.REQUIRED_MARKER}</span>
        ) : null}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e): void => onChange(name, e.target.value)}
          placeholder={placeholder}
          style={{ minHeight: "6rem", resize: "vertical", fontSize: "0.75rem" }}
        />
      ) : type === "select" ? (
        <Select value={selectedValue} onValueChange={(val): void => onChange(name, val)}>
          <SelectTrigger
            style={{ height: "2.25rem", width: "100%", minWidth: 0, fontSize: "0.75rem" }}
          >
            <SelectValue placeholder={placeholder || COMMON_COPY.ACTIONS.SELECT_OPTION} />
          </SelectTrigger>
          <SelectContent
            style={{
              maxHeight: "15rem",
              minWidth: "12.5rem",
              overflowY: "auto",
              padding: "0.25rem",
            }}
          >
            {options?.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                style={{
                  cursor: "pointer",
                  padding: "0.375rem 0.625rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                <span>{opt.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "multiselect" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", paddingTop: "0.125rem" }}>
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
                  style={{
                    cursor: "pointer",
                    borderRadius: "var(--radius-md, 0.375rem)",
                    border: isSelected
                      ? "1px solid color-mix(in oklab, var(--primary) 50%, transparent)"
                      : "1px solid var(--border)",
                    backgroundColor: isSelected
                      ? "color-mix(in oklab, var(--primary) 15%, transparent)"
                      : "color-mix(in oklab, var(--background) 60%, transparent)",
                    color: isSelected ? "var(--primary)" : "var(--mutedForeground)",
                    padding: "0.25rem 0.625rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    transition: "all 150ms ease",
                  }}
                >
                  {isSelected
                    ? COMMON_COPY.FORM.PREFIX_SELECTED
                    : COMMON_COPY.FORM.PREFIX_UNSELECTED}
                  {opt.label}
                </button>
              );
            })
          ) : (
            <span
              style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", fontStyle: "italic" }}
            >
              {COMMON_COPY.FORM.NO_OPTIONS}
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
          style={{ height: "2.25rem", fontSize: "0.75rem" }}
        />
      )}

      {helperText ? (
        <p
          style={{
            color: "var(--mutedForeground)",
            fontSize: "0.6875rem",
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p style={{ color: "var(--destructive)", fontSize: "0.6875rem", margin: 0 }}>{error}</p>
      ) : null}
    </div>
  );
}
