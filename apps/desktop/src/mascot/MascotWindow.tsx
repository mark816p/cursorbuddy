import React, { useState } from "react";

export type MascotState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "pointing"
  | "happy"
  | "confused"
  | "error"
  | "paused";

export interface MascotWindowProps {
  initialState?: MascotState;
  initialMicLevel?: number;
}

export const MascotWindow: React.FC<MascotWindowProps> = ({
  initialState = "idle",
  initialMicLevel = 0.4,
}) => {
  const [state] = useState<MascotState>(initialState);
  const [micLevel] = useState<number>(initialMicLevel);

  return (
    <div className="w-[160px] h-[160px] flex items-center justify-center relative bg-transparent select-none pointer-events-none">
      {/* Audio Pulse Waveform (during listening) */}
      {state === "listening" && (
        <div
          className="absolute rounded-full border-2 border-blue-400/60 transition-all duration-75"
          style={{
            width: `${100 + micLevel * 50}px`,
            height: `${100 + micLevel * 50}px`,
            boxShadow: `0 0 15px rgba(59, 130, 246, ${0.3 + micLevel * 0.4})`,
          }}
        />
      )}

      {/* Mascot Animated Character (SVG) */}
      <svg
        viewBox="0 0 120 120"
        className={`w-28 h-28 filter drop-shadow-xl transition-transform duration-300 ${
          state === "thinking" ? "animate-bounce" : ""
        }`}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* Mascot Body */}
        <ellipse cx="60" cy="62" rx="42" ry="38" fill="url(#bodyGrad)" />

        {/* Cute Ears / Antenna */}
        <circle cx="34" cy="28" r="9" fill="#3b82f6" />
        <circle cx="86" cy="28" r="9" fill="#3b82f6" />

        {/* Eyes based on state */}
        {state === "paused" ? (
          // Sleeping eyes
          <g stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M 44 58 Q 50 63 56 58" />
            <path d="M 64 58 Q 70 63 76 58" />
          </g>
        ) : state === "happy" ? (
          // Joyful curve eyes
          <g stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M 44 60 Q 50 52 56 60" />
            <path d="M 64 60 Q 70 52 76 60" />
          </g>
        ) : (
          // Normal open eyes
          <g fill="#ffffff">
            <ellipse cx="50" cy="56" rx="6" ry="8" />
            <ellipse cx="70" cy="56" rx="6" ry="8" />
            <circle cx="52" cy="54" r="2.5" fill="#1e293b" />
            <circle cx="72" cy="54" r="2.5" fill="#1e293b" />
          </g>
        )}

        {/* Mouth */}
        {state === "speaking" ? (
          <ellipse cx="60" cy="74" rx="7" ry="5" fill="#1e293b" className="animate-pulse" />
        ) : state === "confused" ? (
          <ellipse cx="60" cy="74" rx="4" ry="4" fill="#1e293b" />
        ) : (
          <path
            d="M 52 72 Q 60 78 68 72"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Confused / Question mark badge */}
        {state === "confused" && (
          <text x="88" y="35" fontSize="20" fill="#f59e0b" fontWeight="bold">
            ?
          </text>
        )}
      </svg>
    </div>
  );
};
