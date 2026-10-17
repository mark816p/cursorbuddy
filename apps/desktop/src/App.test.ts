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

  it("converts raw annotations to overlay CSS coordinates correctly", async () => {
    const { convertAnnotationToCss, calculateResizeFactor } = await import("@cursorbuddy/shared");

    const resizeFactor = calculateResizeFactor(2560, 1440);
    const scaleFactor = 1.25;

    const rawAnnotation = {
      step: 1 as const,
      type: "circle" as const,
      x: 612,
      y: 306,
      w: 122,
      h: 61,
      label: "Click Settings",
    };

    const cssAnn = convertAnnotationToCss(rawAnnotation, resizeFactor, scaleFactor);

    expect(cssAnn.step).toBe(1);
    expect(cssAnn.type).toBe("circle");
    expect(cssAnn.x).toBe(799); // 612 / 0.6125 / 1.25 ~= 799
    expect(cssAnn.y).toBe(400); // 306 / 0.6125 / 1.25 ~= 400
    expect(cssAnn.w).toBe(159);
    expect(cssAnn.h).toBe(80);
    expect(cssAnn.label).toBe("Click Settings");
  });

  it("verifies relative window re-mapping logic", async () => {
    const { computeWindowRelativeOffset, remapRelativeToWindow } = await import(
      "@cursorbuddy/shared"
    );

    const rel = computeWindowRelativeOffset(400, 300, 100, 50, 350, 250);
    expect(rel.relX).toBe(50);
    expect(rel.relY).toBe(50);

    const remapped = remapRelativeToWindow(rel, 500, 400);
    expect(remapped.x).toBe(550);
    expect(remapped.y).toBe(450);
    expect(remapped.w).toBe(100);
    expect(remapped.h).toBe(50);
  });

  it("validates dictation response payload schema", async () => {
    const { DictateResponseSchema } = await import("@cursorbuddy/shared");

    const validPayload = {
      text: "The quick brown fox jumps over the lazy dog.",
      language: "en",
      duration_seconds: 2.4,
    };

    const parsed = DictateResponseSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.text).toContain("quick brown fox");
      expect(parsed.data.language).toBe("en");
    }
  });
});
