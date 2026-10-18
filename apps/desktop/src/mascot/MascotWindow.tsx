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
      {/* Audio Waveform Concentric Ring during listening */}
      {state === "listening" && (
        <>
          <div
            className="absolute rounded-full border-2 border-blue-400/80 transition-all duration-75"
            style={{
              width: `${90 + micLevel * 60}px`,
              height: `${90 + micLevel * 60}px`,
              boxShadow: `0 0 25px rgba(59, 130, 246, ${0.4 + micLevel * 0.6})`,
            }}
          />
          <div
            className="absolute rounded-full border border-teal-400/50 transition-all duration-100"
            style={{
              width: `${110 + micLevel * 40}px`,
              height: `${110 + micLevel * 40}px`,
            }}
          />
        </>
      )}

      {/* Mascot Animated Character (SVG) */}
      <svg
        viewBox="0 0 120 120"
        className={`w-28 h-28 filter drop-shadow-2xl transition-transform duration-300 ${
          state === "thinking"
            ? "animate-bounce"
            : state === "happy"
            ? "scale-105"
            : state === "listening"
            ? "scale-105"
            : ""
        }`}
      >
        <defs>
          <linearGradient id="bodyGrad3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="35%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <radialGradient id="highlightGrad" cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="mascotGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Mascot Body with 3D gradient */}
        <ellipse cx="60" cy="62" rx="42" ry="38" fill="url(#bodyGrad3d)" />
        {/* Soft lighting highlight */}
        <ellipse cx="60" cy="62" rx="42" ry="38" fill="url(#highlightGrad)" />

        {/* Cute Ears / Antennas */}
        <circle cx="34" cy="27" r="9" fill="#2563eb" />
        <circle cx="86" cy="27" r="9" fill="#2563eb" />
        <circle cx="34" cy="27" r="4.5" fill="#60a5fa" />
        <circle cx="86" cy="27" r="4.5" fill="#60a5fa" />
        <circle cx="34" cy="25" r="1.5" fill="#ffffff" />
        <circle cx="86" cy="25" r="1.5" fill="#ffffff" />

        {/* Pointing Arm Gesture */}
        {state === "pointing" && (
          <g filter="url(#mascotGlow)">
            <path
              d="M 85 68 Q 105 75 116 86"
              stroke="#2563eb"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="116" cy="86" r="6" fill="#60a5fa" stroke="#ffffff" strokeWidth="1.5" />
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
            <path d="M 44 60 Q 50 49 56 60" />
            <path d="M 64 60 Q 70 49 76 60" />
          </g>
        ) : state === "error" ? (
          // Concerned eyes
          <g stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round">
            <line x1="45" y1="52" x2="55" y2="60" />
            <line x1="65" y1="60" x2="75" y2="52" />
          </g>
        ) : (
          // Expressive eyes with multi-layer glint
          <g fill="#ffffff">
            <ellipse cx="50" cy="56" rx="6.5" ry="8.5" />
            <ellipse cx="70" cy="56" rx="6.5" ry="8.5" />
            <circle cx="52" cy="55" r="3.5" fill="#0f172a" />
            <circle cx="72" cy="55" r="3.5" fill="#0f172a" />
            <circle cx="54" cy="53" r="1.5" fill="#ffffff" />
            <circle cx="74" cy="53" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* Dynamic Mouth with Lip-Sync */}
        {state === "speaking" ? (
          <ellipse
            cx="60"
            cy="75"
            rx="7"
            ry={Math.max(3, ttsAmplitude * 10)}
            fill="#0f172a"
            stroke="#ffffff"
            strokeWidth="1"
          />
        ) : state === "confused" ? (
          <ellipse cx="60" cy="74" rx="4" ry="4" fill="#0f172a" />
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
