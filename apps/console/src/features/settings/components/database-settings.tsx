import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Switch,
} from "@yuva-devlab/ui";
import { Database } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Props for DatabaseSettings component.
 */
export interface DatabaseSettingsProps {
  /** Database URI connection string */
  readonly databaseUri: string;
  /** Whether outbox poller daemon is enabled */
  readonly outboxEnabled: boolean;
  /** Callback on outbox toggle change */
  readonly onOutboxChange?: (checked: boolean) => void;
}

/**
 * Settings section for database persistence and outbox polling.
 */
export function DatabaseSettings({
  databaseUri,
  outboxEnabled,
  onOutboxChange,
}: DatabaseSettingsProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-border/50 border-b pb-3">
        <div className="flex items-center gap-2">
          <Database className="text-primary size-4" />
          <CardTitle className="text-sm font-semibold">{UI_COPY.SETTINGS.DATABASE.TITLE}</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground text-xs">
          {UI_COPY.SETTINGS.DATABASE.DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">{UI_COPY.SETTINGS.DATABASE.URI_LABEL}</Label>
          <Input
            defaultValue={databaseUri}
            className="bg-background/50 font-mono text-xs"
            readOnly
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold">{UI_COPY.SETTINGS.DATABASE.OUTBOX_TITLE}</span>
            <p className="text-muted-foreground text-[11px]">
              {UI_COPY.SETTINGS.DATABASE.OUTBOX_DESC}
            </p>
          </div>
          <Switch
            checked={outboxEnabled}
            onCheckedChange={onOutboxChange}
            aria-label={UI_COPY.SETTINGS.DATABASE.OUTBOX_A11Y}
          />
        </div>
      </CardContent>
    </Card>
  );
}
