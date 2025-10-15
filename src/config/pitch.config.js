// overlay/pitchOverlay.config.js
export const defaultPitchConfig = {
  pitchSize: 720,
  timing: {
    drawMs: 3000,
    holdMs: 3000,
    minStepMs: 40,
  },
  geometry: {
    viewBox: "0 0 278 62",
    corners: {
      TL: [48.0068, 0.721],
      TR: [228.203, 1.58326],
      BR: [276.485, 61.0737],
      BL: [1.44922, 59.7805],
    },
    pathBulge: 0.62,
  },
  visuals: {
    showGrid: false,
    showAxes: false,
    showTicks: false,
    gridStepPct: 10,
    ballSize: 18,
  },
  styles: {
    strokeColor: "rgba(255,255,255,0.85)",
    staticDasharray: "2 2",
    staticStrokeWidth: 0.8,
    animStrokeWidth: 0.8,
    gridStroke: "rgba(255,255,255,0.16)",
    gridStrokeWidth: 0.7,
    axesStroke: "rgba(255,255,255,0.5)",
    axesStrokeWidth: 1.2,
    tickFontSize: 4.5,
    tickColor: "rgba(255,255,255,0.6)",
  },
  classes: {
    staticPathClass: "path-arc",
    animPathClass: "path-arc-anim",
  },
  behavior: {
    animGhostOpacity: 0,
    completedOpacity: 1,
  },
};
