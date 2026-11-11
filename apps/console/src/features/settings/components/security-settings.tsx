import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
} from "@orchestrai/ui";
import { ShieldCheck } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Props for SecuritySettings component.
 */
export interface SecuritySettingsProps {
  /** Execution timeout limit in seconds */
  readonly maxTimeoutSeconds: number;
  /** Max retry count before routing to DLQ */
  readonly maxRetryLimit: number;
}

/**
 * Settings section for execution boundaries, timeouts, and DLQ limits.
 */
export function SecuritySettings({
  maxTimeoutSeconds,
  maxRetryLimit,
}: SecuritySettingsProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader
        style={{
          borderBottom: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          paddingBottom: "0.75rem",
        }}
      >
        <div className="orch-flex-row orch-gap-sm" style={{ alignItems: "center" }}>
          <ShieldCheck className="orch-text-primary" style={{ width: "1rem", height: "1rem" }} />
          <CardTitle style={{ fontSize: "0.875rem", fontWeight: 600 }}>
            {UI_COPY.SETTINGS.SECURITY.TITLE}
          </CardTitle>
        </div>
        <CardDescription className="orch-text-muted" style={{ fontSize: "0.75rem" }}>
          {UI_COPY.SETTINGS.SECURITY.DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent
        style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div className="orch-flex-col orch-gap-xs">
            <Label style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {UI_COPY.SETTINGS.SECURITY.MAX_TIMEOUT}
            </Label>
            <Input
              defaultValue={maxTimeoutSeconds.toString()}
              className="orch-font-mono"
              style={{
                fontSize: "0.75rem",
                backgroundColor: "color-mix(in oklab, var(--background) 50%, transparent)",
              }}
            />
          </div>
          <div className="orch-flex-col orch-gap-xs">
            <Label style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {UI_COPY.SETTINGS.SECURITY.MAX_RETRY_LIMIT}
            </Label>
            <Input
              defaultValue={maxRetryLimit.toString()}
              className="orch-font-mono"
              style={{
                fontSize: "0.75rem",
                backgroundColor: "color-mix(in oklab, var(--background) 50%, transparent)",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
