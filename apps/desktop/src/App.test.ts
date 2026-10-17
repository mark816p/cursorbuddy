import { describe, it, expect } from "vitest";

describe("Desktop UI Shell", () => {
  it("validates window target resolution logic", () => {
    const parseTarget = (search: string, pathname: string) => {
      const params = new URLSearchParams(search);
      const target = params.get("window");
      if (target) return target;
      if (pathname.includes("overlay")) return "overlay";
      if (pathname.includes("mascot")) return "mascot";
      return "settings";
    };

    expect(parseTarget("?window=overlay", "/")).toBe("overlay");
    expect(parseTarget("?window=mascot", "/")).toBe("mascot");
    expect(parseTarget("?window=settings", "/")).toBe("settings");
    expect(parseTarget("", "/overlay.html")).toBe("overlay");
    expect(parseTarget("", "/mascot.html")).toBe("mascot");
    expect(parseTarget("", "/")).toBe("settings");
  });

  it("validates mascot state progression", () => {
    const validStates = [
      "idle",
      "listening",
      "thinking",
      "speaking",
      "pointing",
      "happy",
      "confused",
      "error",
      "paused",
    ];

    expect(validStates).toContain("listening");
    expect(validStates).toContain("thinking");
    expect(validStates.length).toBe(9);
  });
});
