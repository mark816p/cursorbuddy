import { AnnotationItem } from "./schemas/annotations.js";

/**
 * Display geometry used for coordinate conversions.
 */
export interface DisplayGeometry {
  /** Monitor scale factor (e.g. 1.0, 1.25, 1.5, 2.0). */
  scaleFactor: number;
  /** Image downscale factor: 1568 / max(phys_w, phys_h) when > 1568, else 1.0. */
  resizeFactor: number;
  /** Physical width of the monitor in pixels. */
  physicalWidth: number;
  /** Physical height of the monitor in pixels. */
  physicalHeight: number;
  /** Physical X origin on the virtual desktop (can be negative). */
  originX: number;
  /** Physical Y origin on the virtual desktop (can be negative). */
  originY: number;
}

/**
 * Convert a model coordinate (in resized image pixels) to monitor-local physical pixels.
 */
export function modelToPhysicalPx(modelCoord: number, resizeFactor: number): number {
  if (resizeFactor <= 0) {
    throw new Error("resizeFactor must be strictly positive");
  }
  return modelCoord / resizeFactor;
}

/**
 * Convert monitor-local physical pixels to overlay webview CSS pixels.
 */
export function physicalToCssPx(physicalPx: number, scaleFactor: number): number {
  if (scaleFactor <= 0) {
    throw new Error("scaleFactor must be strictly positive");
  }
  return physicalPx / scaleFactor;
}

/**
 * Direct conversion from model pixel coordinate to monitor-local webview CSS pixels.
 */
export function modelToOverlayCssPx(
  modelCoord: number,
  resizeFactor: number,
  scaleFactor: number
): number {
  const phys = modelToPhysicalPx(modelCoord, resizeFactor);
  return physicalToCssPx(phys, scaleFactor);
}

/**
 * Convert monitor-local physical pixels to global virtual desktop physical pixels.
 */
export function physicalToGlobalPhysicalPx(localPhysicalPx: number, originPx: number): number {
  return originPx + localPhysicalPx;
}

/**
 * Compute resize factor for an image whose physical dimensions are (width, height)
 * with a maximum long-edge constraint of 1568px.
 */
export function calculateResizeFactor(physicalWidth: number, physicalHeight: number): number {
  const maxEdge = Math.max(physicalWidth, physicalHeight);
  if (maxEdge > 1568) {
    return 1568 / maxEdge;
  }
  return 1.0;
}

export interface ConvertedAnnotation {
  step: number;
  type: AnnotationItem["type"];
  x: number;
  y: number;
  w: number;
  h: number;
  from_x?: number;
  from_y?: number;
  to_x?: number;
  to_y?: number;
  label?: string;
  element_id?: string;
}

/**
 * Transform an entire AnnotationItem from model coordinates to monitor overlay CSS pixels.
 */
export function convertAnnotationToCss(
  ann: AnnotationItem,
  resizeFactor: number,
  scaleFactor: number
): ConvertedAnnotation {
  const result: ConvertedAnnotation = {
    step: ann.step,
    type: ann.type,
    x: Math.round(modelToOverlayCssPx(ann.x, resizeFactor, scaleFactor)),
    y: Math.round(modelToOverlayCssPx(ann.y, resizeFactor, scaleFactor)),
    w: Math.round(modelToOverlayCssPx(ann.w, resizeFactor, scaleFactor)),
    h: Math.round(modelToOverlayCssPx(ann.h, resizeFactor, scaleFactor)),
    label: ann.label,
    element_id: ann.element_id,
  };

  if (ann.from_x !== undefined && ann.from_y !== undefined) {
    result.from_x = Math.round(modelToOverlayCssPx(ann.from_x, resizeFactor, scaleFactor));
    result.from_y = Math.round(modelToOverlayCssPx(ann.from_y, resizeFactor, scaleFactor));
  }

  if (ann.to_x !== undefined && ann.to_y !== undefined) {
    result.to_x = Math.round(modelToOverlayCssPx(ann.to_x, resizeFactor, scaleFactor));
    result.to_y = Math.round(modelToOverlayCssPx(ann.to_y, resizeFactor, scaleFactor));
  }

  return result;
}

export interface WindowRelativeBounds {
  relX: number;
  relY: number;
  w: number;
  h: number;
}

/**
 * Compute an annotation's position relative to its target window's top-left corner.
 */
export function computeWindowRelativeOffset(
  annX: number,
  annY: number,
  annW: number,
  annH: number,
  windowX: number,
  windowY: number
): WindowRelativeBounds {
  return {
    relX: annX - windowX,
    relY: annY - windowY,
    w: annW,
    h: annH,
  };
}

/**
 * Re-map relative window bounds to new window position when target window moves.
 */
export function remapRelativeToWindow(
  rel: WindowRelativeBounds,
  newWindowX: number,
  newWindowY: number
): { x: number; y: number; w: number; h: number } {
  return {
    x: newWindowX + rel.relX,
    y: newWindowY + rel.relY,
    w: rel.w,
    h: rel.h,
  };
}
