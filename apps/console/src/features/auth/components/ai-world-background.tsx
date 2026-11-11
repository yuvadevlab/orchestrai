"use client";

/**
 * @file apps/console/src/features/auth/components/ai-world-background.tsx
 * @description Dynamic Neural Synapse Canvas & Aurora Mesh tailored to the cyber cyan/teal theme.
 * @module apps/console/features/auth
 */

import React, { useEffect, useRef } from "react";
import {
  type NodePoint,
  NEURAL_PALETTE,
  NEURAL_SYNAPSE_COLOR,
} from "./ai-world-background.constants";
import { UI_COPY } from "@/lib/ui-copy";

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
        color: NEURAL_PALETTE[i % NEURAL_PALETTE.length] ?? NEURAL_PALETTE[0]!,
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
            ctx.strokeStyle = `rgba(${NEURAL_SYNAPSE_COLOR.primary}, ${alpha})`;
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
              ctx.shadowColor = NEURAL_SYNAPSE_COLOR.pulseGlow;
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
    <div className="ai-world-bg" aria-hidden="true">
      {/* 1. Deep Vibrant Aurora Nebulas matching the cyber cyan/teal theme */}
      <div className="orch-animate-ai-drift ai-world-nebula-top">
        <div className="ai-world-nebula-top__glow" />
      </div>

      <div className="orch-animate-ai-drift-slow ai-world-nebula-left">
        <div className="ai-world-nebula-left__glow" />
      </div>

      <div className="orch-animate-ai-drift ai-world-nebula-right">
        <div className="ai-world-nebula-right__glow" />
      </div>

      {/* 2. Cybernetic Perspective Grid Horizon */}
      <div className="ai-world-matrix" style={{ position: "absolute", inset: 0, opacity: 0.9 }} />

      {/* 3. Interactive Living Neural Synapse Canvas */}
      <canvas ref={canvasRef} className="ai-world-canvas" />

      {/* 4. Cybernetic Telemetry Overlays */}
      <div className="ai-world-telemetry-top">
        <span
          style={{
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "9999px",
            backgroundColor: "var(--primary)",
          }}
        />
        <span>{UI_COPY.AUTH.CARD.SWARM_ACTIVE}</span>
      </div>

      <div className="ai-world-telemetry-bottom">
        <span
          style={{
            width: "0.375rem",
            height: "0.375rem",
            borderRadius: "9999px",
            backgroundColor: "var(--primary)",
          }}
        />
        <span>{UI_COPY.AUTH.CARD.RUNTIME_READY}</span>
      </div>
    </div>
  );
}
