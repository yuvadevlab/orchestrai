import React from "react";

/**
 * Cybernetic background SVG topology constellation.
 * Renders interconnected animated pulse nodes representing active agent topology.
 */
export function TopologyConstellation(): React.JSX.Element {
  const nodes = [
    { x: 14, y: 22 },
    { x: 38, y: 12 },
    { x: 68, y: 26 },
    { x: 86, y: 54 },
    { x: 62, y: 74 },
    { x: 30, y: 62 },
    { x: 50, y: 44 },
  ];

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      style={{ opacity: 0.22 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {nodes.map((node, index) =>
        nodes
          .slice(index + 1)
          .map((other, otherIndex) => (
            <line
              key={`${index}-${otherIndex}`}
              x1={node.x}
              y1={node.y}
              x2={other.x}
              y2={other.y}
              stroke="currentColor"
              strokeWidth={0.08}
              className="text-primary"
            />
          )),
      )}
      {nodes.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={0.5}
          className="fill-primary"
          style={{ animation: `pulse 3.6s ease-in-out ${index * 0.4}s infinite` }}
        />
      ))}
    </svg>
  );
}
