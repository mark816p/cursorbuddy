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
            const rx = Math.max(12, ann.w / 2);
            const ry = Math.max(12, ann.h / 2);
            const cx = ann.x + rx;
            const cy = ann.y + ry;

            return (
              <motion.g
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                filter="url(#glow)"
              >
                {/* Outer pulsing ring */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx + 6}
                  ry={ry + 6}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity={0.6}
                  className="animate-pulse"
                />

                {/* Primary bounding ellipse */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="rgba(59, 130, 246, 0.12)"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                />

                {/* Step badge */}
                <circle cx={cx - rx} cy={cy - ry} r="13" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <text
                  x={cx - rx}
                  y={cy - ry + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {ann.step}
                </text>

                {/* Optional label */}
                {ann.label && (
                  <g transform={`translate(${cx + rx + 8}, ${cy - 12})`}>
                    <rect
                      x="0"
                      y="0"
                      width={Math.min(240, ann.label.length * 8 + 16)}
                      height="26"
                      rx="6"
                      fill="#0f172a"
                      fillOpacity={0.9}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                    />
                    <text
                      x="8"
                      y="17"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="500"
                      fontFamily="sans-serif"
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
                transition={{ duration: 0.4 }}
                filter="url(#glow)"
              >
                {/* Arrow line */}
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                />

                {/* Origin step badge */}
                <circle cx={fromX} cy={fromY} r="13" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <text
                  x={fromX}
                  y={fromY + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {ann.step}
                </text>

                {/* Label if provided */}
                {ann.label && (
                  <g transform={`translate(${(fromX + toX) / 2}, ${(fromY + toY) / 2 - 28})`}>
                    <rect
                      x="0"
                      y="0"
                      width={Math.min(240, ann.label.length * 8 + 16)}
                      height="24"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity={0.9}
                      stroke="#3b82f6"
                      strokeWidth="1"
                    />
                    <text
                      x="8"
                      y="16"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="500"
                      fontFamily="sans-serif"
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
                transition={{ duration: 0.3 }}
                filter="url(#glow)"
              >
                <rect
                  x={ann.x}
                  y={ann.y}
                  width={ann.w}
                  height={ann.h}
                  rx="6"
                  fill="rgba(59, 130, 246, 0.18)"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />

                {/* Step badge */}
                <circle cx={ann.x} cy={ann.y} r="12" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <text
                  x={ann.x}
                  y={ann.y + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {ann.step}
                </text>
              </motion.g>
            );
          }

          if (ann.type === "note") {
            const noteText = ann.label || "Click here";
            const noteWidth = Math.min(280, noteText.length * 8.5 + 48);

            return (
              <motion.g
                key={key}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                filter="url(#glow)"
              >
                {/* Pointer indicator */}
                <circle cx={ann.x} cy={ann.y} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />

                {/* Note Bubble */}
                <g transform={`translate(${ann.x + 8}, ${ann.y - 18})`}>
                  <rect
                    width={noteWidth}
                    height="36"
                    rx="8"
                    fill="#0f172a"
                    fillOpacity={0.95}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Step Badge */}
                  <circle cx="18" cy="18" r="10" fill="#2563eb" />
                  <text
                    x="18"
                    y="22"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {ann.step}
                  </text>
                  {/* Label Text */}
                  <text
                    x="34"
                    y="22"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="500"
                    fontFamily="sans-serif"
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
