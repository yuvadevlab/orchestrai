"use client";

/**
 * @file apps/console/src/features/auth/components/ai-world-background.tsx
 * @description Dynamic Neural Synapse Canvas & Aurora Mesh tailored to the warm lime (#aac064) theme.
 * @module apps/console/features/auth
 */

import React, { useEffect, useRef } from "react";

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  pulseSpeed: number;
  pulseOffset: number;
}

/**
 * Neural node color palette harmonious with primary warm lime (#aac064).
 */
const PALETTE = [
  "rgba(170, 192, 100, 0.85)", // Warm Lime (#aac064)
  "rgba(251, 191, 36, 0.85)", // Solar Amber (#fbbf24)
  "rgba(74, 222, 128, 0.85)", // Cyber Mint (#4ade80)
  "rgba(217, 249, 157, 0.85)", // Pale Chartreuse (#d9f99d)
];

/**
 * Interactive Neural Synapse Canvas animating glowing interconnected AI nodes,
 * drifting synaptic links, and rich ambient aurora gradients.
 */
export function AiWorldBackground(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize neural nodes matching staged density
    const nodeCount = Math.min(Math.floor((width * height) / 18000), 75);
    const nodes: NodePoint[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const radius = 1.5 + Math.random() * 2;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius,
        baseRadius: radius,
        color: PALETTE[i % PALETTE.length] ?? "rgba(170, 192, 100, 0.85)",
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = (): void => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let time = 0;
    const render = (): void => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      const maxDistance = 140;

      // Draw glowing synaptic connection lines
      for (let i = 0; i < nodes.length; i++) {
        const p1 = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const p2 = nodes[j]!;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.4;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(170, 192, 100, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Occasional glowing energy pulse along line
            if (dist < 80 && Math.sin(time + i + j) > 0.85) {
              const t = (Math.sin(time * 2 + i) + 1) / 2;
              const px = p1.x + (p2.x - p1.x) * t;
              const py = p1.y + (p2.y - p1.y) * t;
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
              ctx.shadowColor = "rgba(170, 192, 100, 1)";
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw neural nodes with glowing aura
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around screen boundaries
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        const dynamicRadius =
          node.baseRadius + Math.sin(time * node.pulseSpeed * 10 + node.pulseOffset) * 0.8;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, dynamicRadius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = node.color.replace("0.85", "0.25");
        ctx.fill();

        // Solid core
        ctx.beginPath();
        ctx.arc(node.x, node.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Deep Vibrant Aurora Nebulas matching staged sizes and blurs */}
      <div className="animate-ai-drift absolute -top-40 left-1/2 -translate-x-1/2">
        <div className="via-primary/30 h-130 w-195 rounded-full bg-linear-to-tr from-[#aac064]/25 to-amber-500/20 blur-[120px]" />
      </div>

      <div className="animate-ai-drift-slow absolute -bottom-48 -left-32">
        <div className="via-primary/20 h-120 w-155 rounded-full bg-linear-to-br from-emerald-600/20 to-amber-600/15 blur-[130px]" />
      </div>

      <div className="animate-ai-drift absolute top-1/4 -right-32">
        <div className="via-primary/20 h-110 w-140 rounded-full bg-linear-to-bl from-amber-500/20 to-lime-400/15 blur-[110px]" />
      </div>

      {/* 2. Cybernetic Perspective Grid Horizon */}
      <div className="ai-world-matrix absolute inset-0 opacity-90" />

      {/* 3. Interactive Living Neural Synapse Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      {/* 4. Cybernetic Telemetry Overlays */}
      <div className="text-primary/80 absolute top-5 left-6 hidden items-center gap-2 font-mono text-[11px] tracking-widest sm:flex">
        <span className="bg-primary size-2 animate-pulse rounded-full" />
        <span>MULTI-AGENT SWARM // ACTIVE</span>
      </div>

      <div className="text-muted-foreground/70 absolute right-6 bottom-5 hidden items-center gap-2 font-mono text-[10px] tracking-widest sm:flex">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        <span>AGENT RUNTIME // READY</span>
      </div>
    </div>
  );
}
