// pitchOverlay.config.js
export const defaultPitchOverlayConfig = {
  timing: {
    // total time to animate the FULL sequence (ball → path → ball …)
    drawMs: 3000,
    // how long to keep the completed drawing visible before hiding
    holdMs: 3000,
    // minimum per-step duration guard (prevents too-fast steps on short sequences)
    minStepMs: 40,
  },

  geometry: {
    // Same viewBox as PitchSvg
    viewBox: "0 0 278 62",
    // Pitch trapezoid corners
    corners: {
      TL: [48.0068, 0.721],
      TR: [228.203, 1.58326],
      BR: [276.485, 61.0737],
      BL: [1.44922, 59.7805],
    },
    // Bézier arc roundness between points (0..1)
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
    // core stroke styling
    strokeColor: "rgba(255,255,255,0.85)",
    staticDasharray: "1 8",
    staticStrokeWidth: 0.8,
    animStrokeWidth: 0.8,

    // grid/axes/ticks styling
    gridStroke: "rgba(255,255,255,0.16)",
    gridStrokeWidth: 0.7,
    axesStroke: "rgba(255,255,255,0.5)",
    axesStrokeWidth: 1.2,
    tickFontSize: 4.5,
    tickColor: "rgba(255,255,255,0.6)",
  },

  classes: {
    // class hooks if you want to style via CSS
    staticPathClass: "path-arc",
    animPathClass: "path-arc-anim",
  },

  behavior: {
    // Blink fix: render a dashed “ghost” of the animating path at opacity 0
    // so when it completes there’s no mount/unmount flash.
    animGhostOpacity: 0,
    completedOpacity: 1,
  },
};
