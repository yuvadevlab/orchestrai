import type { Metadata } from "next";
import React from "react";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import { ConfigProvider, Toaster } from "@yuva-devlab/ui";
import { AppQueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "OrchestrAI Cowork — Universal Autonomous AI Agent Workspace",
  description:
    "Universal Autonomous AI Agent & Cowork Platform for research, document creation, engineering, and data analytics.",
};

/**
 * Root Layout for OrchestrAI Console application.
 *
 * WHY ConfigProvider only (no local ThemeProvider):
 *   ConfigProvider from @yuva-devlab/ui sets data-brand="orchestrai" AND
 *   data-theme="orchestrai-dark/light" on <html>. Our theme CSS (orchestrai.css)
 *   scopes tokens to those exact selectors. A second ThemeProvider that also
 *   writes class="dark/light" conflicts and causes light mode to appear broken.
 */
export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <ConfigProvider brand="orchestrai" defaultTheme="dark" storageKey="orchestrai-theme">
          <AppQueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </AppQueryProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
