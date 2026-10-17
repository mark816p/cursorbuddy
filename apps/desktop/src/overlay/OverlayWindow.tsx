import React, { useEffect, useState, useRef } from "react";
import { ConvertedAnnotation } from "@cursorbuddy/shared";
import { AnnotationLayer } from "./AnnotationLayer.js";
import { DebugGrid } from "./DebugGrid.js";

export interface OverlayWindowProps {
  initialAnnotations?: ConvertedAnnotation[];
  calibrationGrid?: boolean;
}

export const OverlayWindow: React.FC<OverlayWindowProps> = ({
  initialAnnotations = [],
  calibrationGrid = false,
}) => {
  const [annotations, setAnnotations] = useState<ConvertedAnnotation[]>(initialAnnotations);
  const [showCalibrationGrid, setShowCalibrationGrid] = useState(calibrationGrid);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetDismissTimer = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    // 30-second auto-fade
    dismissTimerRef.current = setTimeout(() => {
      setAnnotations([]);
    }, 30000);
  };

  useEffect(() => {
    // 1. Keyboard dismiss on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAnnotations([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // 2. Setup Tauri event listeners if running inside Tauri
    let unlistenRender: (() => void) | undefined;
    let unlistenClear: (() => void) | undefined;
    let unlistenGrid: (() => void) | undefined;

    const setupTauriListeners = async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");

        unlistenRender = await listen<ConvertedAnnotation[]>("render_annotations", (event) => {
          setAnnotations(event.payload);
          resetDismissTimer();
        });

        unlistenClear = await listen("clear_annotations", () => {
          setAnnotations([]);
          if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
          }
        });

        unlistenGrid = await listen<boolean>("toggle_calibration_grid", (event) => {
          setShowCalibrationGrid(event.payload);
        });
      } catch {
        // Fallback for standalone browser preview / testing
      }
    };

    setupTauriListeners();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      if (unlistenRender) unlistenRender();
      if (unlistenClear) unlistenClear();
      if (unlistenGrid) unlistenGrid();
    };
  }, []);

  return (
    <div className="w-screen h-screen relative bg-transparent overflow-hidden pointer-events-none select-none">
      <svg className="w-full h-full absolute inset-0">
        <defs>
          {/* Arrowhead marker definition */}
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="9"
            refX="10"
            refY="4.5"
            orient="auto"
          >
            <polygon points="0 0, 12 4.5, 0 9" fill="#3b82f6" />
          </marker>

          {/* Glow filter */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Optional 100px Calibration Grid */}
        <DebugGrid visible={showCalibrationGrid} />

        {/* Animated Annotation Marks */}
        <AnnotationLayer annotations={annotations} />
      </svg>
    </div>
  );
};
export default OverlayWindow;
