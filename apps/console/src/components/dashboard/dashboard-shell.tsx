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
    <div className="bg-background text-foreground flex h-screen w-screen overflow-hidden">
      {/* Left Sidebar */}
      <SidebarNav />

      {/* Right Column: TopBar + Page Body */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 space-y-6 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
