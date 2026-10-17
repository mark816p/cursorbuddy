import React, { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

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
  initialMicLevel = 0.3,
}) => {
  const [state, setState] = useState<MascotState>(initialState);
  const [micLevel, setMicLevel] = useState<number>(initialMicLevel);
  const [ttsAmplitude, setTtsAmplitude] = useState<number>(0.0);

  useEffect(() => {
    let unlistenDown: (() => void) | undefined;
    let unlistenUp: (() => void) | undefined;
    let unlistenEnergy: (() => void) | undefined;
    let unlistenTts: (() => void) | undefined;
    let unlistenState: (() => void) | undefined;

    const setupListeners = async () => {
      try {
        unlistenDown = await listen("hotkey_down", () => {
          setState("listening");
        });

        unlistenUp = await listen("hotkey_up", () => {
          setState("thinking");
        });

        unlistenEnergy = await listen<number>("mic_energy", (event) => {
          setMicLevel(event.payload);
        });

        unlistenTts = await listen<number>("tts_amplitude", (event) => {
          setTtsAmplitude(event.payload);
          if (event.payload > 0.05) {
            setState("speaking");
          } else if (state === "speaking") {
            setState("pointing");
          }
        });

        unlistenState = await listen<MascotState>("set_mascot_state", (event) => {
          setState(event.payload);
        });
      } catch {
        // Fallback outside Tauri
      }
    };

    setupListeners();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setState("idle");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unlistenDown?.();
      unlistenUp?.();
      unlistenEnergy?.();
      unlistenTts?.();
      unlistenState?.();
    };
  }, [state]);

  return (
    <div className="w-[160px] h-[160px] flex items-center justify-center relative bg-transparent select-none pointer-events-none">
      {/* Audio Waveform Ring during listening */}
      {state === "listening" && (
        <div
          className="absolute rounded-full border-2 border-blue-400/70 transition-all duration-75"
          style={{
            width: `${90 + micLevel * 60}px`,
            height: `${90 + micLevel * 60}px`,
            boxShadow: `0 0 20px rgba(59, 130, 246, ${0.4 + micLevel * 0.5})`,
          }}
        />
      )}

      {/* Mascot Animated Character (SVG) */}
      <svg
        viewBox="0 0 120 120"
        className={`w-28 h-28 filter drop-shadow-xl transition-transform duration-300 ${
          state === "thinking"
            ? "animate-bounce"
            : state === "happy"
            ? "scale-105"
            : ""
        }`}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="mascotGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Mascot Body */}
        <ellipse cx="60" cy="62" rx="42" ry="38" fill="url(#bodyGrad)" />

        {/* Cute Ears / Antenna */}
        <circle cx="34" cy="28" r="9" fill="#3b82f6" />
        <circle cx="86" cy="28" r="9" fill="#3b82f6" />
        <circle cx="34" cy="28" r="4" fill="#93c5fd" />
        <circle cx="86" cy="28" r="4" fill="#93c5fd" />

        {/* Pointing Arm Gesture */}
        {state === "pointing" && (
          <g filter="url(#mascotGlow)">
            {/* Extended pointing arm toward bottom right / annotation target */}
            <path
              d="M 85 68 Q 105 75 115 85"
              stroke="#2563eb"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="115" cy="85" r="5" fill="#60a5fa" />
          </g>
        )}

        {/* Eyes based on state */}
        {state === "paused" ? (
          // Sleeping eyes
          <g stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M 44 58 Q 50 63 56 58" />
            <path d="M 64 58 Q 70 63 76 58" />
            <text x="86" y="44" fill="#93c5fd" fontSize="12" fontWeight="bold">
              Zzz
            </text>
          </g>
        ) : state === "happy" ? (
          // Joyful curve eyes
          <g stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round">
            <path d="M 44 60 Q 50 50 56 60" />
            <path d="M 64 60 Q 70 50 76 60" />
          </g>
        ) : state === "error" ? (
          // Concerned eyes
          <g stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round">
            <line x1="45" y1="52" x2="55" y2="60" />
            <line x1="65" y1="60" x2="75" y2="52" />
          </g>
        ) : (
          // Normal open eyes with glint
          <g fill="#ffffff">
            <ellipse cx="50" cy="56" rx="6" ry="8" />
            <ellipse cx="70" cy="56" rx="6" ry="8" />
            <circle cx="52" cy="54" r="3" fill="#0f172a" />
            <circle cx="72" cy="54" r="3" fill="#0f172a" />
            <circle cx="54" cy="52" r="1.2" fill="#ffffff" />
            <circle cx="74" cy="52" r="1.2" fill="#ffffff" />
          </g>
        )}

        {/* Dynamic Mouth with Lip-Sync */}
        {state === "speaking" ? (
          // Amplitude-driven mouth opening
          <ellipse
            cx="60"
            cy="75"
            rx="6.5"
            ry={Math.max(2.5, ttsAmplitude * 9)}
            fill="#0f172a"
          />
        ) : state === "confused" ? (
          <ellipse cx="60" cy="74" rx="3.5" ry="3.5" fill="#0f172a" />
        ) : state === "error" ? (
          <path
            d="M 52 76 Q 60 70 68 76"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 52 72 Q 60 78 68 72"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Badges for confused or error */}
        {state === "confused" && (
          <text x="88" y="36" fontSize="22" fill="#f59e0b" fontWeight="bold">
            ?
          </text>
        )}
        {state === "error" && (
          <text x="88" y="36" fontSize="20" fill="#ef4444" fontWeight="bold">
            !
          </text>
        )}
      </svg>
    </div>
  );
};
export default MascotWindow;
