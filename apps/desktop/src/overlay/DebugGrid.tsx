import React from "react";

export interface DebugGridProps {
  visible: boolean;
  gridSize?: number;
}

export const DebugGrid: React.FC<DebugGridProps> = ({ visible, gridSize = 100 }) => {
  if (!visible) return null;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const numCols = Math.ceil(width / gridSize);
  const numRows = Math.ceil(height / gridSize);

  return (
    <g className="calibration-grid pointer-events-none select-none">
      {/* 100px Grid Lines */}
      {Array.from({ length: numCols + 1 }).map((_, i) => (
        <line
          key={`col-${i}`}
          x1={i * gridSize}
          y1={0}
          x2={i * gridSize}
          y2={height}
          stroke="#3b82f6"
          strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
          strokeOpacity={i % 5 === 0 ? 0.35 : 0.15}
        />
      ))}

      {Array.from({ length: numRows + 1 }).map((_, i) => (
        <line
          key={`row-${i}`}
          x1={0}
          y1={i * gridSize}
          x2={width}
          y2={i * gridSize}
          stroke="#3b82f6"
          strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
          strokeOpacity={i % 5 === 0 ? 0.35 : 0.15}
        />
      ))}

      {/* Axis Coordinate Numbers */}
      {Array.from({ length: numCols }).map((_, i) => (
        <text
          key={`col-label-${i}`}
          x={i * gridSize + 4}
          y={16}
          fill="#3b82f6"
          fontSize="10"
          fontFamily="monospace"
          opacity={0.6}
        >
          {i * gridSize}
        </text>
      ))}

      {Array.from({ length: numRows }).map((_, i) => (
        <text
          key={`row-label-${i}`}
          x={4}
          y={i * gridSize + 14}
          fill="#3b82f6"
          fontSize="10"
          fontFamily="monospace"
          opacity={0.6}
        >
          {i * gridSize}
        </text>
      ))}

      {/* Center Screen Crosshairs */}
      <circle
        cx={width / 2}
        cy={height / 2}
        r="24"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        opacity={0.8}
      />
      <line
        x1={width / 2 - 36}
        y1={height / 2}
        x2={width / 2 + 36}
        y2={height / 2}
        stroke="#ef4444"
        strokeWidth="1.5"
        opacity={0.8}
      />
      <line
        x1={width / 2}
        y1={height / 2 - 36}
        x2={width / 2}
        y2={height / 2 + 36}
        stroke="#ef4444"
        strokeWidth="1.5"
        opacity={0.8}
      />

      {/* Info Badge */}
      <g transform="translate(16, 32)">
        <rect
          width="210"
          height="48"
          rx="6"
          fill="#09090b"
          fillOpacity={0.85}
          stroke="#3b82f6"
          strokeWidth="1"
        />
        <text x="12" y="20" fill="#f4f4f5" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          CALIBRATION GRID MODE
        </text>
        <text x="12" y="36" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
          CSS: {width} x {height} px | DPR: {window.devicePixelRatio.toFixed(2)}
        </text>
      </g>
    </g>
  );
};
