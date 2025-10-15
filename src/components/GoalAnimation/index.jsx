// GoalAnimation.jsx
import { useMemo } from "react";
import { defaultPitchConfig } from "../../config/pitch.config";
import { deepMerge } from "../../utils/deepMerge";
import { makeQuadLerp, makeToScreen, makeRoundedArcPath } from "../../utils/geometry";
import { useGoalSequence } from "../../hooks/useGoalSequence";

import Grid from "./Grid";
import Axes from "./Axes";
import Ticks from "./Ticks";
import Balls from "./Balls";
import Paths from "./Paths";

/**
 * Props:
 * - goals, minute
 * - config?: deep-partial of defaultPitchConfig
 * - className?
 * - onSequenceStart?, onSequenceEnd?
 */
export default function GoalAnimation({
  goals,
  minute,
  className = "",
  config,
  onSequenceStart,
  onSequenceEnd,
}) {
  const cfg = useMemo(() => deepMerge(defaultPitchConfig, config), [config]);

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

  // Geometry factories
  const quadLerp = useMemo(() => makeQuadLerp(corners), [corners]);
  const toScreen = useMemo(() => makeToScreen(quadLerp), [quadLerp]);
  const roundedArcPath = useMemo(() => makeRoundedArcPath(pathBulge), [pathBulge]);

  // Build grid lines (view-only)
  const gridLines = useMemo(() => {
    if (!showGrid) return [];
    const lines = [];
    for (let u = 0; u <= 100; u += gridStepPct) {
      const U = u / 100, a = quadLerp(U, 0), b = quadLerp(U, 1);
      lines.push({ key: `v-${u}`, d: `M ${a.x} ${a.y} L ${b.x} ${b.y}` });
    }
    for (let v = 0; v <= 100; v += gridStepPct) {
      const V = v / 100, a = quadLerp(0, V), b = quadLerp(1, V);
      lines.push({ key: `h-${v}`, d: `M ${a.x} ${a.y} L ${b.x} ${b.y}` });
    }
    return lines;
  }, [showGrid, gridStepPct, quadLerp]);

  // Axes points
  const x0 = quadLerp(0, 1);
  const x1 = quadLerp(1, 1);
  const y0 = quadLerp(0, 1);
  const y1 = quadLerp(0, 0);

  // Animation + derived pieces
  const {
    activeStamp,
    screenPts,
    arcDs,
    shownBalls,
    animatingPathIndex,
    completedPathCount,
  } = useGoalSequence({
    goals,
    minute,
    drawMs,
    holdMs,
    minStepMs,
    toScreen,
    roundedArcPath,
    onSequenceStart,
    onSequenceEnd,
  });

  return (
    <div className={`pitch-overlay ${className}`}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="overlay-surface"
      >
        {showGrid && (
          <Grid lines={gridLines} stroke={gridStroke} strokeWidth={gridStrokeWidth} />
        )}

        {showAxes && (
          <Axes x0={x0} x1={x1} y0={y0} y1={y1} stroke={axesStroke} strokeWidth={axesStrokeWidth} />
        )}

        {showTicks && (
          <Ticks quadLerp={quadLerp} fontSize={tickFontSize} fill={tickColor} />
        )}

        <Paths
          arcDs={arcDs}
          activeStamp={activeStamp}
          animatingPathIndex={animatingPathIndex}
          completedPathCount={completedPathCount}
          strokeColor={strokeColor}
          staticStrokeWidth={staticStrokeWidth}
          animStrokeWidth={animStrokeWidth}
          staticDasharray={staticDasharray}
          staticPathClass={staticPathClass}
          animPathClass={animPathClass}
          animGhostOpacity={animGhostOpacity}
          completedOpacity={completedOpacity}
          stepMs={
            completedPathCount >= 0
              ? Math.max(minStepMs, Math.floor(drawMs / (arcDs.length * 2 + 1 || 1)))
              : minStepMs
          }
        />

        <Balls
          points={screenPts}
          shownCount={shownBalls}
          ballSize={ballSize}
          stamp={activeStamp}
        />
      </svg>
    </div>
  );
}
