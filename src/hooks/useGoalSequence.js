// overlay/hooks/useGoalSequence.js
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Encapsulates: trigger on goal-minute crossing, step timing, hold/reset,
 * derived counts for balls/paths, and arc path building.
 */
export function useGoalSequence({
  goals,
  minute,
  drawMs,
  holdMs,
  minStepMs,
  toScreen,
  roundedArcPath,
  onSequenceStart,
  onSequenceEnd,
}) {
  const goalMinutes = useMemo(
    () => goals.map(g => g.minute).sort((a, b) => a - b),
    [goals]
  );
  const prevMinuteRef = useRef(minute);
  const [activeStamp, setActiveStamp] = useState(0);
  const [activePoints, setActivePoints] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    const prev = prevMinuteRef.current;
    const curr = minute;
    prevMinuteRef.current = curr;

    const hit = goalMinutes.some(gm => gm > prev && gm <= curr);
    if (!hit) return;

    clearTimers();
    const pts = goals.map(({ x, y }) => ({ x, y }));
    setActivePoints(pts);
    setCurrentStep(-1);
    setActiveStamp(s => s + 1);
    onSequenceStart?.();
    const t0 = setTimeout(() => setCurrentStep(0), 1);
    timersRef.current.push(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, goalMinutes, goals]);

  const screenPts = useMemo(() => activePoints.map(toScreen), [activePoints, toScreen]);

  const arcDs = useMemo(() => {
    const out = [];
    for (let i = 1; i < screenPts.length; i++) {
      out.push(roundedArcPath(screenPts[i - 1], screenPts[i]));
    }
    return out;
  }, [screenPts, roundedArcPath]);

  const stepCount = activePoints.length ? 2 * activePoints.length - 1 : 0;
  const stepMs = stepCount ? Math.max(minStepMs, Math.floor(drawMs / stepCount)) : drawMs;

  useEffect(() => {
    if (stepCount === 0) return;

    if (currentStep >= 0 && currentStep < stepCount - 1) {
      const id = setTimeout(() => setCurrentStep(s => s + 1), stepMs);
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

  // Derived visibility
  const shownBalls = currentStep < 0 ? 0 : Math.ceil((currentStep + 1) / 2);
  const animatingPathIndex =
    currentStep % 2 === 1 ? Math.floor(currentStep / 2) : -1;
  const completedPathCount =
    currentStep < 0 ? 0 : Math.floor(currentStep / 2);

  return {
    activeStamp,
    screenPts,
    arcDs,
    shownBalls,
    animatingPathIndex,
    completedPathCount,
  };
}
