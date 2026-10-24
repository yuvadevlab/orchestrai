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
    <Card className="border-border bg-card">
      <CardHeader className="border-border/50 border-b pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary size-4" />
          <CardTitle className="text-sm font-semibold">{UI_COPY.SETTINGS.SECURITY.TITLE}</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground text-xs">
          {UI_COPY.SETTINGS.SECURITY.DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium">{UI_COPY.SETTINGS.SECURITY.MAX_TIMEOUT}</Label>
            <Input
              defaultValue={maxTimeoutSeconds.toString()}
              className="bg-background/50 font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              {UI_COPY.SETTINGS.SECURITY.MAX_RETRY_LIMIT}
            </Label>
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
