import React, { useState } from "react";
import { Bug, Crosshair, RefreshCw, Eye } from "lucide-react";

export const DebugPanel: React.FC = () => {
  const [debugMode, setDebugMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [lastCapturePath, setLastCapturePath] = useState<string | null>(null);

  const simulateCaptureTest = () => {
    setLastCapturePath("C:\\Users\\kinja\\AppData\\Local\\Temp\\cursorbuddy_debug_capture.jpg");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
          <Bug className="w-5 h-5 text-amber-400" />
          Diagnostics & Coordinate Calibration
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Inspect coordinate pipeline mappings and test screen capture downscaling.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-200">Debug Capture Mode</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Temporarily saves the last captured screenshot to a local temp file for inspection.
            </div>
          </div>
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              debugMode
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            {debugMode ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div>
            <div className="font-medium text-slate-200 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-blue-400" />
              Overlay Calibration Grid
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Renders a 100px crosshair grid on the transparent overlay to verify DPI scaling.
            </div>
          </div>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              showGrid
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            {showGrid ? "Showing Grid" : "Hide Grid"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" />
            Last Captured Frame
          </span>
          <button
            onClick={simulateCaptureTest}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Simulate Capture Check
          </button>
        </div>

        {lastCapturePath ? (
          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-slate-300 space-y-1">
            <div className="text-slate-400">Target File:</div>
            <div className="text-emerald-400 break-all">{lastCapturePath}</div>
            <div className="text-slate-500 pt-1">
              Downscale: Max edge &le; 1568px | Compression: JPEG 85 | Redaction: 2 windows applied
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/50 rounded">
            No capture recorded in this session.
          </div>
        )}
      </div>
    </div>
  );
};
