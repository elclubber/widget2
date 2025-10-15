// PitchOverlayAxes.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import BallSvg from "./BallSvg";
import { defaultPitchOverlayConfig } from "./pitchOverlay.config";

// Small utility to deep-merge user overrides into defaults
function deepMerge(base, override) {
  if (!override) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(override)) {
    const bv = base?.[k];
    const ov = override[k];
    if (bv && typeof bv === "object" && !Array.isArray(bv) && typeof ov === "object" && !Array.isArray(ov)) {
      out[k] = deepMerge(bv, ov);
    } else {
      out[k] = ov;
    }
  }
  return out;
}

/**
 * Solid path that draws itself (dashoffset) when 'animateKey' changes.
 * Stays artifact-free during animation. Completed segment is provided
 * separately as a dashed static stroke (pre-rendered to prevent blink).
 */
function AnimatedArcSolid({ d, durationMs, className, animateKey, stroke, strokeWidth }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const L = el.getTotalLength();
    el.style.transition = "none";
    el.style.strokeDasharray = `${L}`;
    el.style.strokeDashoffset = `${L}`;

    requestAnimationFrame(() => {
      el.style.transition = `stroke-dashoffset ${durationMs}ms linear`;
      el.style.strokeDashoffset = "0";
    });
  }, [d, durationMs, animateKey]);

  return (
    <path
      ref={ref}
      d={d}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

/**
 * PitchOverlayAxes
 *
 * Props:
 * - goals:  Array<{ minute:number, team:string, x:number, y:number }>
 * - minute: number (current virtual minute)
 * - config?: Partial<typeof defaultPitchOverlayConfig>
 * - className?: string
 * - onSequenceStart?: () => void
 * - onSequenceEnd?: () => void
 */
export default function PitchOverlayAxes({
  goals,
  minute,
  config,
  className = "",
  onSequenceStart,
  onSequenceEnd,
}) {
  const cfg = useMemo(
    () => deepMerge(defaultPitchOverlayConfig, config),
    [config]
  );

  const {
    timing: { drawMs, holdMs, minStepMs },
    geometry: { viewBox, corners, pathBulge },
    visuals: { showGrid, showAxes, showTicks, gridStepPct, ballSize },
    styles: {
      strokeColor, staticDasharray, staticStrokeWidth, animStrokeWidth,
      gridStroke, gridStrokeWidth, axesStroke, axesStrokeWidth,
      tickFontSize, tickColor,
    },
    classes: { staticPathClass, animPathClass },
    behavior: { animGhostOpacity, completedOpacity },
  } = cfg;

  const TL = corners.TL, TR = corners.TR, BR = corners.BR, BL = corners.BL;

  // ---- Geometry helpers
  const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const quadLerp = (u, v) => {
    const top = lerp2(TL, TR, u);
    const bot = lerp2(BL, BR, u);
    const p = lerp2(top, bot, v);
    return { x: p[0], y: p[1] };
  };
  const toScreen = ({ x, y }) => quadLerp(x / 100, 1 - y / 100);

  const roundedArcPath = (p0, p1) => {
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    let nx = -uy, ny = ux;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const h = len * pathBulge;
    const c1x = p0.x + ux * (len / 3) + nx * h;
    const c1y = p0.y + uy * (len / 3) + ny * h;
    const c2x = p0.x + ux * (2 * len / 3) + nx * h;
    const c2y = p0.y + uy * (2 * len / 3) + ny * h;
    return `M ${p0.x} ${p0.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${p1.x} ${p1.y}`;
  };

  // ---- Trigger: replay FULL sequence whenever we hit/cross a goal minute
  const goalMinutes = useMemo(
    () => goals.map((g) => g.minute).sort((a, b) => a - b),
    [goals]
  );
  const prevMinuteRef = useRef(minute);
  const [activeStamp, setActiveStamp] = useState(0); // restart key
  const [activePoints, setActivePoints] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1); // -1 hidden
  const timersRef = useRef([]);
  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  useEffect(() => {
    const prev = prevMinuteRef.current;
    const curr = minute;
    prevMinuteRef.current = curr;

    const hit = goalMinutes.some((gm) => gm > prev && gm <= curr);
    if (!hit) return;

    clearTimers();
    const pts = goals.map(({ x, y }) => ({ x, y })); // FULL set
    setActivePoints(pts);
    setCurrentStep(-1);
    setActiveStamp((s) => s + 1);
    onSequenceStart?.();
    const t0 = setTimeout(() => setCurrentStep(0), 1);
    timersRef.current.push(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, goalMinutes, goals]);

  // ---- Build screen points & paths
  const screenPts = useMemo(() => activePoints.map(toScreen), [activePoints]);
  const arcDs = useMemo(() => {
    const out = [];
    for (let i = 1; i < screenPts.length; i++) {
      out.push(roundedArcPath(screenPts[i - 1], screenPts[i]));
    }
    return out;
  }, [screenPts]);

  // N points → 2N−1 steps (ball, path, ball, path, ..., ball)
  const stepCount = activePoints.length ? 2 * activePoints.length - 1 : 0;
  const stepMs = stepCount ? Math.max(minStepMs, Math.floor(drawMs / stepCount)) : drawMs;

  useEffect(() => {
    if (stepCount === 0) return;

    if (currentStep >= 0 && currentStep < stepCount - 1) {
      const id = setTimeout(() => setCurrentStep((s) => s + 1), stepMs);
      timersRef.current.push(id);
      return () => clearTimeout(id);
    }

    if (currentStep === stepCount - 1) {
      const holdId = setTimeout(() => {
        setCurrentStep(-1);
        setActivePoints([]);
        onSequenceEnd?.();
      }, holdMs);
      timersRef.current.push(holdId);
      return () => clearTimeout(holdId);
    }
  }, [currentStep, stepCount, stepMs, holdMs, onSequenceEnd]);

  useEffect(() => () => clearTimers(), []);

  // Visibility math
  const shownBalls = currentStep < 0 ? 0 : Math.ceil((currentStep + 1) / 2);
  const animatingPathIndex =
    currentStep % 2 === 1 ? Math.floor(currentStep / 2) : -1;
  const completedPathCount =
    currentStep < 0 ? 0 : Math.floor(currentStep / 2);

  // Grid
  const gridLines = [];
  if (showGrid) {
    for (let u = 0; u <= 100; u += gridStepPct) {
      const U = u / 100, a = quadLerp(U, 0), b = quadLerp(U, 1);
      gridLines.push(
        <path
          key={`v-${u}`}
          d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
          stroke={gridStroke}
          strokeWidth={gridStrokeWidth}
          shapeRendering="crispEdges"
        />
      );
    }
    for (let v = 0; v <= 100; v += gridStepPct) {
      const V = v / 100, a = quadLerp(0, V), b = quadLerp(1, V);
      gridLines.push(
        <path
          key={`h-${v}`}
          d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
          stroke={gridStroke}
          strokeWidth={gridStrokeWidth}
          shapeRendering="crispEdges"
        />
      );
    }
  }

  const x0 = quadLerp(0, 1);
  const x1 = quadLerp(1, 1);
  const y0 = quadLerp(0, 1);
  const y1 = quadLerp(0, 0);

  // Balls
  const balls = [];
  for (let i = 0; i < Math.min(shownBalls, screenPts.length); i++) {
    const p = screenPts[i];
    balls.push(
      <g
        key={`ball-${i}-${activeStamp}`}
        transform={`translate(${p.x - ballSize / 5}, ${p.y - ballSize / 20})`}
      >
        <BallSvg size={ballSize / 2.6} />
      </g>
    );
  }

  // Paths (blink-free)
  const paths = [];

  // 1) Completed paths + "ghost" of current animating path (opacity 0)
  for (let i = 0; i < arcDs.length; i++) {
    const isCompleted = i < completedPathCount;
    const isCurrentAnim = i === animatingPathIndex;
    if (isCompleted || isCurrentAnim) {
      paths.push(
        <path
          key={`arc-static-${i}-${activeStamp}`}
          d={arcDs[i]}
          className={staticPathClass}
          fill="none"
          stroke={strokeColor}
          strokeWidth={staticStrokeWidth}
          strokeDasharray={staticDasharray}
          opacity={isCurrentAnim && !isCompleted ? animGhostOpacity : completedOpacity}
        />
      );
    }
  }

  // 2) The currently animating solid path
  if (animatingPathIndex >= 0 && animatingPathIndex < arcDs.length) {
    paths.push(
      <AnimatedArcSolid
        key={`arc-anim-${animatingPathIndex}-${activeStamp}-${currentStep}`}
        d={arcDs[animatingPathIndex]}
        durationMs={stepMs}
        className={animPathClass}
        animateKey={`${activeStamp}-${currentStep}`}
        stroke={strokeColor}
        strokeWidth={animStrokeWidth}
      />
    );
  }

  return (
    <div className={`pitch-overlay ${className}`}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="overlay-surface"
      >
        {/* GRID */}
        {showGrid && <g>{gridLines}</g>}

        {/* AXES */}
        {showAxes && (
          <g stroke={axesStroke} strokeWidth={axesStrokeWidth}>
            <path d={`M ${x0.x} ${x0.y} L ${x1.x} ${x1.y}`} />
            <path d={`M ${y0.x} ${y0.y} L ${y1.x} ${y1.y}`} />
          </g>
        )}

        {/* Ticks */}
        {showTicks && (
          <g fill={tickColor} fontSize={tickFontSize} fontFamily="system-ui, sans-serif">
            {[0, 20, 40, 60, 80, 100].map((u) => {
              const p = quadLerp(u / 100, 1);
              return (
                <text key={`xt-${u}`} x={p.x} y={p.y + 4} textAnchor="middle">
                  {u}%
                </text>
              );
            })}
            {[0, 20, 40, 60, 80, 100].map((v) => {
              const p = quadLerp(0, 1 - v / 100);
              return (
                <text key={`yt-${v}`} x={p.x - 4} y={p.y} textAnchor="end">
                  {v}%
                </text>
              );
            })}
          </g>
        )}

        {/* Paths + Balls */}
        {paths}
        {balls}
      </svg>
    </div>
  );
}
