import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
} from "@yuva-devlab/ui";
import { ShieldCheck } from "lucide-react";

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
    <Card className="border-border bg-card">
      <CardHeader className="border-border/50 border-b pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary size-4" />
          <CardTitle className="text-sm font-semibold">Security Boundaries & Limits</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground text-xs">
          Execution timeouts, rate limits, and approval workflows.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Max Execution Timeout (seconds)</Label>
            <Input
              defaultValue={maxTimeoutSeconds.toString()}
              className="bg-background/50 font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Max Retry Exhaustion Limit</Label>
            <Input
              defaultValue={maxRetryLimit.toString()}
              className="bg-background/50 font-mono text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
