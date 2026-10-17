import React, { useEffect, useState } from "react";
import { ConvertedAnnotation } from "@cursorbuddy/shared";

export interface OverlayWindowProps {
  initialAnnotations?: ConvertedAnnotation[];
  calibrationGrid?: boolean;
}

export const OverlayWindow: React.FC<OverlayWindowProps> = ({
  initialAnnotations = [],
  calibrationGrid = false,
}) => {
  const [annotations, setAnnotations] = useState<ConvertedAnnotation[]>(initialAnnotations);
  const [showCalibrationGrid] = useState(calibrationGrid);

  useEffect(() => {
    // Escape key listener to dismiss annotations immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAnnotations([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen relative bg-transparent overflow-hidden pointer-events-none select-none">
      <svg className="w-full h-full absolute inset-0">
        <defs>
          {/* Arrowhead marker definition */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Optional 100px Calibration Grid */}
        {showCalibrationGrid && (
          <g opacity={0.25} stroke="#3b82f6" strokeWidth={1}>
            {Array.from({ length: 40 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 100} y1={0} x2={i * 100} y2={2160} />
            ))}
            {Array.from({ length: 25 }).map((_, i) => (
              <line key={`h-${i}`} x1={0} y1={i * 100} x2={3840} y2={i * 100} />
            ))}
          </g>
        )}

        {/* Render Annotations */}
        {annotations.map((ann, idx) => {
          if (ann.type === "circle") {
            const rx = ann.w / 2;
            const ry = ann.h / 2;
            const cx = ann.x + rx;
            const cy = ann.y + ry;
            return (
              <g key={idx} filter="url(#glow)">
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
                {/* Step badge */}
                <circle cx={cx - rx} cy={cy - ry} r="12" fill="#2563eb" />
                <text
                  x={cx - rx}
                  y={cy - ry + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {ann.step}
                </text>
              </g>
            );
          }

          if (ann.type === "arrow" && ann.from_x !== undefined && ann.to_x !== undefined) {
            return (
              <g key={idx} filter="url(#glow)">
                <line
                  x1={ann.from_x}
                  y1={ann.from_y}
                  x2={ann.to_x}
                  y2={ann.to_y}
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          }

          if (ann.type === "highlight") {
            return (
              <rect
                key={idx}
                x={ann.x}
                y={ann.y}
                width={ann.w}
                height={ann.h}
                rx="6"
                fill="rgba(59, 130, 246, 0.15)"
                stroke="#3b82f6"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
};
