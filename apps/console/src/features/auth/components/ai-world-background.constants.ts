/**
 * @file apps/console/src/features/auth/components/ai-world-background.constants.ts
 * @description Theme tokens and node interface for AI World neural canvas animation.
 * @module apps/console/features/auth
 */

/**
 * Representation of an individual drifting neural node on the canvas.
 */
export interface NodePoint {
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
 * Neural node color palette harmonious with OrchestrAI cyber cyan/teal theme:
 * - Electric Teal / Primary (oklch(0.76 0.115 195) -> rgb(61, 200, 200))
 * - Cyber Sky Blue (rgb(56, 189, 248))
 * - Neo-Mint / Emerald (oklch(74% 0.14 160) -> rgb(71, 197, 140))
 * - Luminous Aqua (rgb(103, 232, 249))
 */
export const NEURAL_PALETTE: readonly string[] = [
  "rgba(61, 200, 200, 0.85)", // Electric Teal (#3dc8c8)
  "rgba(56, 189, 248, 0.85)", // Cyber Sky (#38bdf8)
  "rgba(71, 197, 140, 0.85)", // Neo-Mint (#47c58c)
  "rgba(103, 232, 249, 0.85)", // Luminous Aqua (#67e8f9)
];

/**
 * Primary accent color used for neural synaptic line strokes and pulse glows.
 */
export const NEURAL_SYNAPSE_COLOR = {
  primary: "61, 200, 200",
  pulseGlow: "rgba(61, 200, 200, 1)",
} as const;
