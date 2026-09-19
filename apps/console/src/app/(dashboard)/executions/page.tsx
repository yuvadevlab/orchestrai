import React from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { StatusChip } from "@yuva-devlab/ui";
import { executions } from "@/lib/mock-db";

/**
 * Audit history table of all orchestrated agent runs.
 */
export default function ExecutionsPage(): React.JSX.Element {
  return (
    <PageShell
      title="Executions"
      breadcrumb="Executions"
      description="A replayable record of the work the orchestrator has carried out."
    >
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <table className="w-full text-left text-xs">
          <thead className="border-border bg-secondary/40 text-muted-foreground border-b font-mono text-[10px] tracking-wider uppercase">
            <tr>
              <th className="px-3 py-2">Task</th>
              <th className="hidden px-3 py-2 md:table-cell">Agent</th>
              <th className="hidden px-3 py-2 lg:table-cell">Tools</th>
              <th className="hidden px-3 py-2 lg:table-cell">Tokens</th>
              <th className="px-3 py-2">Duration</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((execution) => (
              <tr
                key={execution.id}
                className="border-border/60 hover:bg-accent/40 border-b transition-colors last:border-0"
              >
                <td className="max-w-sm px-3 py-2">
                  <Link
                    href={`/executions/${execution.id}`}
                    className="hover:text-primary block truncate font-medium"
                  >
                    {execution.task}
                  </Link>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {execution.id}
                  </span>
                </td>
                <td className="text-muted-foreground hidden px-3 py-2 md:table-cell">
                  {execution.agent}
                </td>
                <td className="hidden px-3 py-2 font-mono text-[11px] lg:table-cell">
                  {execution.tools}
                </td>
                <td className="hidden px-3 py-2 font-mono text-[11px] lg:table-cell">
                  {execution.tokens.toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono text-[11px]">{execution.duration}</td>
                <td className="px-3 py-2">
                  <StatusChip status={execution.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
