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
} from "@orchestrai/ui";
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
    <Card>
      <CardHeader
        style={{
          borderBottom: "1px solid color-mix(in oklab, var(--border) 50%, transparent)",
          paddingBottom: "0.75rem",
        }}
      >
        <div className="orch-flex-row orch-gap-sm" style={{ alignItems: "center" }}>
          <Database className="orch-text-primary" style={{ width: "1rem", height: "1rem" }} />
          <CardTitle style={{ fontSize: "0.875rem", fontWeight: 600 }}>
            {UI_COPY.SETTINGS.DATABASE.TITLE}
          </CardTitle>
        </div>
        <CardDescription className="orch-text-muted" style={{ fontSize: "0.75rem" }}>
          {UI_COPY.SETTINGS.DATABASE.DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent
        style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div className="orch-flex-col orch-gap-xs">
          <Label style={{ fontSize: "0.75rem", fontWeight: 500 }}>
            {UI_COPY.SETTINGS.DATABASE.URI_LABEL}
          </Label>
          <Input
            defaultValue={databaseUri}
            className="orch-font-mono"
            style={{
              fontSize: "0.75rem",
              backgroundColor: "color-mix(in oklab, var(--background) 50%, transparent)",
            }}
            readOnly
          />
        </div>
        <div
          className="orch-flex-row orch-justify-between"
          style={{ alignItems: "center", paddingTop: "0.5rem" }}
        >
          <div className="orch-flex-col">
            <span className="orch-font-semibold" style={{ fontSize: "0.75rem" }}>
              {UI_COPY.SETTINGS.DATABASE.OUTBOX_TITLE}
            </span>
            <p className="orch-text-muted" style={{ margin: 0, fontSize: "0.6875rem" }}>
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
