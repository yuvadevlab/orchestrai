import type { Metadata } from "next";
import React from "react";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import { ConfigProvider, Toaster } from "@yuva-devlab/ui";
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
  title: "OrchestrAI Console",
  description: "Enterprise local-first AI agent orchestration platform",
};

/**
 * Root Layout for OrchestrAI Console application.
 * Injects Google Fonts, brand-aware ConfigProvider, toast notifications, and root document shell.
 *
 * @param props.children - Route segment children.
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
          {children}
          <Toaster />
        </ConfigProvider>
      </body>
    </html>
  );
}
