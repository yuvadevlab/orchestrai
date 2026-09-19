import React from "react";
import { Boxes, Brain, Bot, Settings2, ShieldCheck, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { activityFeed } from "@/lib/mock-db";

const kindIcons = {
  execution: Zap,
  approval: ShieldCheck,
  knowledge: Boxes,
  memory: Brain,
  config: Settings2,
  agent: Bot,
} as const;

/**
 * Chronological timeline of all system and agent activities.
 */
export default function ActivityPage(): React.JSX.Element {
  return (
    <PageShell
      title="Activity"
      breadcrumb="Activity"
      description="The system's own record of what changed, what ran and what needed a human."
    >
      <ol className="border-border relative max-w-3xl space-y-2 border-l pl-6">
        {activityFeed.map((item) => {
          const Icon = kindIcons[item.kind] ?? Zap;

          return (
            <li
              key={item.id}
              className="border-border bg-card/60 hover:border-primary/40 relative rounded-lg border p-3 transition-colors"
            >
              <span className="border-border bg-card absolute top-3.5 left-[-2.15rem] grid size-6 place-items-center rounded-full border shadow-sm">
                <Icon className="text-primary size-3.5" />
              </span>
              <div className="flex items-center gap-2">
                <p className="text-foreground text-xs font-semibold">{item.title}</p>
                <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                  {item.at}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                {item.detail}
              </p>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
