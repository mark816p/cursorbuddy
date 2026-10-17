import { describe, it, expect } from "vitest";
import {
  calculateResizeFactor,
  modelToPhysicalPx,
  physicalToCssPx,
  modelToOverlayCssPx,
  physicalToGlobalPhysicalPx,
  convertAnnotationToCss,
  computeWindowRelativeOffset,
  remapRelativeToWindow,
} from "./coordinates.js";
import { AnnotationItem } from "./schemas/annotations.js";

describe("Coordinate Conversion Engine - Test Matrix", () => {
  it("Scenario 1: 100% Windows scaling (1920x1080, scale 1.0)", () => {
    const width = 1920;
    const height = 1080;
    const resizeFactor = calculateResizeFactor(width, height); // 1568 / 1920 = 0.8166666667
    expect(resizeFactor).toBeCloseTo(1568 / 1920, 5);

    // Suppose model points to center of resized image: (1568 / 2 = 784)
    const modelX = 784;
    const physX = modelToPhysicalPx(modelX, resizeFactor);
    expect(physX).toBeCloseTo(960, 1);

    const cssX = physicalToCssPx(physX, 1.0);
    expect(cssX).toBeCloseTo(960, 1);

    const directCssX = modelToOverlayCssPx(modelX, resizeFactor, 1.0);
    expect(directCssX).toBeCloseTo(960, 1);
  });

  it("Scenario 2: 125% Windows scaling (2560x1440, scale 1.25)", () => {
    const width = 2560;
    const height = 1440;
    const scaleFactor = 1.25;
    const resizeFactor = calculateResizeFactor(width, height); // 1568 / 2560 = 0.6125
    expect(resizeFactor).toBeCloseTo(0.6125, 4);

    // Suppose model points to button at model coord x = 612.5 (physical x = 1000)
    const modelX = 612.5;
    const physX = modelToPhysicalPx(modelX, resizeFactor);
    expect(physX).toBeCloseTo(1000, 1);

    // CSS pixels = 1000 / 1.25 = 800
    const cssX = physicalToCssPx(physX, scaleFactor);
    expect(cssX).toBeCloseTo(800, 1);

    expect(modelToOverlayCssPx(modelX, resizeFactor, scaleFactor)).toBeCloseTo(800, 1);
  });

  it("Scenario 3: 150% Windows scaling (3840x2160 4K, scale 1.5)", () => {
    const width = 3840;
    const height = 2160;
    const scaleFactor = 1.5;
    const resizeFactor = calculateResizeFactor(width, height); // 1568 / 3840 = 0.4083333333
    expect(resizeFactor).toBeCloseTo(1568 / 3840, 5);

    // Physical point at (1920, 1080) -> model coord (1920 * factor = 784, 1080 * factor = 441)
    const modelX = 784;
    const modelY = 441;

    const cssX = modelToOverlayCssPx(modelX, resizeFactor, scaleFactor);
    const cssY = modelToOverlayCssPx(modelY, resizeFactor, scaleFactor);

    // Expected CSS = 1920 / 1.5 = 1280, 1080 / 1.5 = 720
    expect(cssX).toBeCloseTo(1280, 1);
    expect(cssY).toBeCloseTo(720, 1);
  });

  it("Scenario 4: macOS Retina 2x (2880x1800, scale 2.0)", () => {
    const width = 2880;
    const height = 1800;
    const scaleFactor = 2.0;
    const resizeFactor = calculateResizeFactor(width, height); // 1568 / 2880
    expect(resizeFactor).toBeCloseTo(1568 / 2880, 5);

    // Point at physical center (1440, 900)
    const modelX = 1440 * resizeFactor;
    const modelY = 900 * resizeFactor;

    const cssX = modelToOverlayCssPx(modelX, resizeFactor, scaleFactor);
    const cssY = modelToOverlayCssPx(modelY, resizeFactor, scaleFactor);

    // Expected CSS = 1440 / 2 = 720, 900 / 2 = 450
    expect(cssX).toBeCloseTo(720, 1);
    expect(cssY).toBeCloseTo(450, 1);
  });

  it("Scenario 5: Multi-monitor with negative-origin secondary monitor (-1920, 0)", () => {
    const secondaryOriginX = -1920;
    const secondaryOriginY = 0;
    const localPhysicalX = 500;
    const localPhysicalY = 300;

    const globalX = physicalToGlobalPhysicalPx(localPhysicalX, secondaryOriginX);
    const globalY = physicalToGlobalPhysicalPx(localPhysicalY, secondaryOriginY);

    expect(globalX).toBe(-1420);
    expect(globalY).toBe(300);
  });

  it("Scenario 6: Vertical/portrait monitor (1440x2560, scale 1.0)", () => {
    const width = 1440;
    const height = 2560;
    const resizeFactor = calculateResizeFactor(width, height); // 1568 / 2560 = 0.6125
    expect(resizeFactor).toBeCloseTo(0.6125, 4);

    // Center of portrait display physical (720, 1280)
    const modelX = 720 * resizeFactor;
    const modelY = 1280 * resizeFactor;

    const cssX = modelToOverlayCssPx(modelX, resizeFactor, 1.0);
    const cssY = modelToOverlayCssPx(modelY, resizeFactor, 1.0);

    expect(cssX).toBeCloseTo(720, 1);
    expect(cssY).toBeCloseTo(1280, 1);
  });

  it("Scenario 7: Full annotation conversion with circle and arrow", () => {
    const resizeFactor = 0.5; // 2x downscale
    const scaleFactor = 1.25; // 125% DPI

    const ann: AnnotationItem = {
      step: 1,
      type: "arrow",
      x: 100,
      y: 150,
      w: 40,
      h: 40,
      from_x: 50,
      from_y: 60,
      to_x: 100,
      to_y: 150,
      label: "Click File Menu",
    };

    const converted = convertAnnotationToCss(ann, resizeFactor, scaleFactor);

    // x = (100 / 0.5) / 1.25 = 200 / 1.25 = 160
    expect(converted.x).toBe(160);
    // y = (150 / 0.5) / 1.25 = 300 / 1.25 = 240
    expect(converted.y).toBe(240);
    expect(converted.w).toBe(64);
    expect(converted.h).toBe(64);
    expect(converted.from_x).toBe(80);
    expect(converted.from_y).toBe(96);
    expect(converted.to_x).toBe(160);
    expect(converted.to_y).toBe(240);
    expect(converted.label).toBe("Click File Menu");
  });

  it("Scenario 8: Window relative persistence re-mapping", () => {
    // Annotation at CSS (500, 300) inside window at (400, 200)
    const rel = computeWindowRelativeOffset(500, 300, 50, 50, 400, 200);
    expect(rel.relX).toBe(100);
    expect(rel.relY).toBe(100);

    // Window moved to (450, 280)
    const remapped = remapRelativeToWindow(rel, 450, 280);
    expect(remapped.x).toBe(550);
    expect(remapped.y).toBe(380);
    expect(remapped.w).toBe(50);
    expect(remapped.h).toBe(50);
  });
});
