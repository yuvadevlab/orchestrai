"use client";

import React from "react";
import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";

export interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Master layout shell for the Console application.
 * Manages responsive layout boundaries, fixed sidebar, and scrollable content area.
 *
 * @param props.children - Active page content.
 */
export function DashboardShell({ children }: DashboardShellProps): React.JSX.Element {
  return (
    <div className="orch-shell">
      {/* Left Sidebar */}
      <SidebarNav />

      {/* Right Column: TopBar + Page Body */}
      <div className="orch-shell__main-col">
        <TopBar />
        <main className="orch-shell__content">{children}</main>
      </div>
    </div>
  );
}
