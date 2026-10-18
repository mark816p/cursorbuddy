import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { SettingsWindow } from "./settings/SettingsWindow.js";
import { OverlayWindow } from "./overlay/OverlayWindow.js";
import { MascotWindow } from "./mascot/MascotWindow.js";
import { OnboardingWindow } from "./onboarding/OnboardingWindow.js";

function getWindowTarget(): string {
  // Check URL query parameters (useful in development and multi-window webview setups)
  const params = new URLSearchParams(window.location.search);
  const target = params.get("window");
  if (target) return target;

  // In Tauri 2, window label can also be inspected
  if (window.location.pathname.includes("overlay")) return "overlay";
  if (window.location.pathname.includes("mascot")) return "mascot";
  if (window.location.pathname.includes("onboarding")) return "onboarding";

  return "settings";
}

const App: React.FC = () => {
  const windowType = getWindowTarget();

  switch (windowType) {
    case "overlay":
      return <OverlayWindow />;
    case "mascot":
      return <MascotWindow />;
    case "onboarding":
      return <OnboardingWindow />;
    case "settings":
    default:
      return <SettingsWindow />;
  }
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
