import React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Panel, StatusChip } from "@yuva-devlab/ui";
import { knowledgeDocs } from "@/lib/mock-db";

function Stat({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <div>
      <dd className="text-foreground font-mono text-xs font-semibold">{value}</dd>
      <dt className="text-muted-foreground text-[10px]">{label}</dt>
    </div>
  );
}

/**
 * Knowledge base and semantic retrieval documents viewer.
 */
export default function KnowledgePage(): React.JSX.Element {
  const indexedCount = knowledgeDocs.filter((doc) => doc.status === "indexed").length;
  const totalChunks = knowledgeDocs.reduce((sum, doc) => sum + doc.chunks, 0);

  return (
    <PageShell
      title="Knowledge"
      breadcrumb="Knowledge"
      description="The retrieval layer agents consult before they answer. Every chunk is traceable back to its source."
      actions={
        <span className="text-muted-foreground font-mono text-[10px]">
          {indexedCount} indexed · {totalChunks.toLocaleString()} chunks
        </span>
      }
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {knowledgeDocs.map((doc) => (
          <Panel key={doc.id}>
            <div className="flex items-start gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{doc.name}</p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  {doc.type} · {doc.size}
                </p>
              </div>
              <span className="ml-auto">
                <StatusChip status={doc.status} />
              </span>
            </div>

            <dl className="border-border mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center">
              <Stat value={String(doc.chunks)} label="chunks" />
              <Stat value={String(doc.retrievals)} label="retrievals" />
              <Stat value={doc.updatedAt} label="updated" />
            </dl>

            <p className="text-muted-foreground mt-3 font-mono text-[10px]">{doc.embedding}</p>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
