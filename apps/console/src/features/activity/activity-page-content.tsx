"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@yuva-devlab/ui";
import { Radio } from "lucide-react";
import { ActivityItem } from "./components/activity-item";
import { MOCK_ACTIVITY_EVENTS } from "./mock-activity";

/**
 * Main feature container view for Activity & Audit Log.
 */
export function ActivityPageContent(): React.JSX.Element {
  const [events] = useState(MOCK_ACTIVITY_EVENTS);

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">
              System Activity & Audit Log
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              Live Telemetry
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Audit stream of outbox events, queue transitions, and worker lifecycle signals.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-border/50 border-b pb-3">
          <div className="flex items-center gap-2">
            <Radio className="text-primary size-4 animate-pulse" />
            <CardTitle className="text-sm font-semibold">Real-Time Event Stream</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-xs">
            Continuous diagnostic log from distributed worker nodes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {events.map((e) => (
            <ActivityItem key={e.id} event={e} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
