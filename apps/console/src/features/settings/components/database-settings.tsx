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
          <CardTitle className="text-sm font-semibold">PostgreSQL & Outbox Topology</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground text-xs">
          Primary relational connection and pgvector storage parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Database Connection URI</Label>
          <Input
            defaultValue={databaseUri}
            className="bg-background/50 font-mono text-xs"
            readOnly
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold">Transactional Outbox Poller</span>
            <p className="text-muted-foreground text-[11px]">
              Automatically flush unpublished outbox records
            </p>
          </div>
          <Switch checked={outboxEnabled} onCheckedChange={onOutboxChange} />
        </div>
      </CardContent>
    </Card>
  );
}
