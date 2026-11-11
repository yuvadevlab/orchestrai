"use client";

/**
 * @file apps/console/src/components/layout/clearance-ticket-details.tsx
 * @description Detail views for clearance ticket inspection.
 * @module apps/console/components/layout
 */

import React from "react";
import { Terminal, FileWarning, AlertTriangle } from "lucide-react";
import type { ConsoleClearanceTicket } from "@/lib/stores/clearance-slice";
import { UI_COPY } from "@/lib/ui-copy";

export interface ClearanceTicketDetailsProps {
  readonly ticket?: ConsoleClearanceTicket;
}

/**
 * Inspector body for an active security clearance ticket.
 */
export function ClearanceTicketDetails({ ticket }: ClearanceTicketDetailsProps): React.JSX.Element {
  if (!ticket) {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <AlertTriangle
          style={{
            color: "var(--mutedForeground)",
            marginBottom: "0.5rem",
            width: "2rem",
            height: "2rem",
          }}
        />
        <p style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", margin: 0 }}>
          {UI_COPY.STUDIO.CLEARANCE.DRAWER.EMPTY_DESC}
        </p>
      </div>
    );
  }

  return (
    <div className="orch-clearance-body">
      <div className="orch-clearance-risk-box">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              color: "var(--destructive)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {UI_COPY.STUDIO.CLEARANCE.DRAWER.RISK_LEVEL(String(ticket.riskLevel))}
          </span>
          <span
            style={{
              color: "var(--mutedForeground)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.625rem",
            }}
          >
            {UI_COPY.STUDIO.CLEARANCE.DRAWER.TICKET_ID(ticket.ticketId.slice(0, 8))}
          </span>
        </div>
        <p
          style={{
            color: "var(--foreground)",
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            marginInline: 0,
            marginBottom: 0,
          }}
        >
          {ticket.description}
        </p>
      </div>

      <div>
        <span
          style={{
            color: "var(--mutedForeground)",
            display: "block",
            fontSize: "0.6875rem",
            fontWeight: 500,
            marginBottom: "0.25rem",
          }}
        >
          {UI_COPY.STUDIO.CLEARANCE.DRAWER.INVOKING_TOOL}
        </span>
        <div className="orch-clearance-tool-box">
          <Terminal style={{ color: "var(--primary)", width: "1rem", height: "1rem" }} />
          <span
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {ticket.toolName}
          </span>
        </div>
      </div>

      {ticket.sensitivePaths && ticket.sensitivePaths.length > 0 && (
        <div>
          <span
            style={{
              color: "var(--mutedForeground)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.6875rem",
              fontWeight: 500,
              marginBottom: "0.25rem",
            }}
          >
            <FileWarning
              style={{ color: "var(--destructive)", width: "0.75rem", height: "0.75rem" }}
            />{" "}
            {UI_COPY.STUDIO.CLEARANCE.DRAWER.BLAST_RADIUS}
          </span>
          <div className="orch-clearance-blast-box">
            {ticket.sensitivePaths.map((path) => (
              <div
                key={path}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingBlock: "0.125rem",
                }}
              >
                • {path}
              </div>
            ))}
          </div>
        </div>
      )}

      {ticket.inputParams && (
        <div>
          <span
            style={{
              color: "var(--mutedForeground)",
              display: "block",
              fontSize: "0.6875rem",
              fontWeight: 500,
              marginBottom: "0.25rem",
            }}
          >
            {UI_COPY.STUDIO.CLEARANCE.DRAWER.PAYLOAD_PARAMS}
          </span>
          <pre className="orch-clearance-payload-box">
            {JSON.stringify(ticket.inputParams, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
