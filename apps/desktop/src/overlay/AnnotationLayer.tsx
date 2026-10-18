import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConvertedAnnotation, UiElementItem, snapAnnotationToUiElement } from "@cursorbuddy/shared";

export interface AnnotationLayerProps {
  annotations: ConvertedAnnotation[];
  elements?: UiElementItem[];
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({ annotations, elements }) => {
  return (
    <AnimatePresence>
      <g className="annotation-layer">
        {annotations.map((rawAnn, idx) => {
          const ann = snapAnnotationToUiElement(rawAnn, elements);
          const key = `ann-${ann.step}-${ann.type}-${idx}`;

          if (ann.type === "circle") {
            const rx = Math.max(14, ann.w / 2);
            const ry = Math.max(14, ann.h / 2);
            const cx = ann.x + rx;
            const cy = ann.y + ry;

            return (
              <motion.g
                key={key}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                filter="url(#glow)"
              >
                {/* Outer pulsing ring */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx + 8}
                  ry={ry + 8}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  opacity={0.7}
                  className="animate-pulse"
                />

                {/* Primary bounding ellipse */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="rgba(59, 130, 246, 0.15)"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                />

                {/* Step badge with drop shadow */}
                <circle cx={cx - rx} cy={cy - ry} r="14" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <text
                  x={cx - rx}
                  y={cy - ry + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {ann.step}
                </text>

                {/* Optional label */}
                {ann.label && (
                  <g transform={`translate(${cx + rx + 10}, ${cy - 14})`}>
                    <rect
                      x="0"
                      y="0"
                      width={Math.min(260, ann.label.length * 8.5 + 20)}
                      height="28"
                      rx="8"
                      fill="#0b0f19"
                      fillOpacity={0.96}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                    />
                    <text
                      x="10"
                      y="18"
                      fill="#f8fafc"
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {ann.label}
                    </text>
                  </g>
                )}
              </motion.g>
            );
          }

          if (ann.type === "arrow" && ann.from_x !== undefined && ann.to_x !== undefined) {
            const fromX = ann.from_x;
            const fromY = ann.from_y ?? ann.y;
            const toX = ann.to_x;
            const toY = ann.to_y ?? ann.y;

            return (
              <motion.g
                key={key}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                filter="url(#glow)"
              >
                {/* Arrow line */}
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#3b82f6"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                />

                {/* Origin step badge */}
                <circle cx={fromX} cy={fromY} r="14" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <text
                  x={fromX}
                  y={fromY + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {ann.step}
                </text>

                {/* Label if provided */}
                {ann.label && (
                  <g transform={`translate(${(fromX + toX) / 2}, ${(fromY + toY) / 2 - 32})`}>
                    <rect
                      x="0"
                      y="0"
                      width={Math.min(260, ann.label.length * 8.5 + 20)}
                      height="26"
                      rx="6"
                      fill="#0b0f19"
                      fillOpacity={0.96}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                    />
                    <text
                      x="10"
                      y="17"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {ann.label}
                    </text>
                  </g>
                )}
              </motion.g>
            );
          }

          if (ann.type === "highlight") {
            return (
              <motion.g
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                filter="url(#glow)"
              >
                <rect
                  x={ann.x}
                  y={ann.y}
                  width={ann.w}
                  height={ann.h}
                  rx="8"
                  fill="rgba(59, 130, 246, 0.18)"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                />

                {/* Step badge */}
                <circle cx={ann.x} cy={ann.y} r="13" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <text
                  x={ann.x}
                  y={ann.y + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {ann.step}
                </text>
              </motion.g>
            );
          }

          if (ann.type === "note") {
            const noteText = ann.label || "Click here";
            const noteWidth = Math.min(300, noteText.length * 8.5 + 54);

            return (
              <motion.g
                key={key}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                filter="url(#glow)"
              >
                {/* Pointer indicator */}
                <circle cx={ann.x} cy={ann.y} r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />

                {/* Note Bubble */}
                <g transform={`translate(${ann.x + 10}, ${ann.y - 20})`}>
                  <rect
                    width={noteWidth}
                    height="38"
                    rx="10"
                    fill="#0b0f19"
                    fillOpacity={0.96}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Step Badge */}
                  <circle cx="20" cy="19" r="11" fill="#2563eb" />
                  <text
                    x="20"
                    y="23"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {ann.step}
                  </text>
                  {/* Label Text */}
                  <text
                    x="38"
                    y="23"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {noteText}
                  </text>
                </g>
              </motion.g>
            );
          }

          return null;
        })}
      </g>
    </AnimatePresence>
  );
};
