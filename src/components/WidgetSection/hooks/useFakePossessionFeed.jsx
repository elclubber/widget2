import { useEffect, useMemo, useState } from "react";

// inputs
const homeTeam = "Z.Brentford";
const awayTeam = "Z.Man City";

/** Simulated frames */
const FRAMES = [
  { left: 35, right: 65, minutes: 5, ballPossTeam: homeTeam },
  { left: 38, right: 62, minutes: 12, ballPossTeam: awayTeam },
  { left: 42, right: 58, minutes: 19, ballPossTeam: homeTeam },
  { left: 48, right: 52, minutes: 27, ballPossTeam: awayTeam },
  { left: 55, right: 45, minutes: 33, ballPossTeam: homeTeam },
  { left: 50, right: 50, minutes: 39, ballPossTeam: awayTeam },
  { left: 44, right: 56, minutes: 44, ballPossTeam: homeTeam },
  { left: 47, right: 53, minutes: 46, ballPossTeam: awayTeam },
  { left: 49, right: 51, minutes: 52, ballPossTeam: homeTeam },
  { left: 53, right: 47, minutes: 58, ballPossTeam: awayTeam },
  { left: 57, right: 43, minutes: 63, ballPossTeam: homeTeam },
  { left: 60, right: 40, minutes: 69, ballPossTeam: awayTeam },
  { left: 62, right: 38, minutes: 75, ballPossTeam: homeTeam },
  { left: 65, right: 35, minutes: 82, ballPossTeam: awayTeam },
  { left: 68, right: 32, minutes: 88, ballPossTeam: homeTeam },
  { left: 70, right: 30, minutes: 90, ballPossTeam: awayTeam },
];

/** Static odds (can be replaced by a real API later) */
const STATIC_ODDS = [
  { label: homeTeam, odds: "1.75", subtitle: "Next Goal" },
  { label: awayTeam, odds: "1.85", subtitle: "Next Goal" },
  { label: "Haaland", odds: "2.75", subtitle: "to score next" },
];

// Mocked goal events – adjust freely
const GOALS = [
  { minute: 6, team: awayTeam, x: 35, y: 85 },
  { minute: 24, team: homeTeam, x: 72, y: 92 },
  { minute: 28, team: homeTeam, x: 100, y: 60 },
];

const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
const lerp = (a, b, t) => a + (b - a) * t;

/** Find the two FRAMES that bracket 'm' (in minutes) */
function bracketFrames(m) {
  if (FRAMES.length === 0) return [null, null, 0];

  // before first or after last
  if (m <= FRAMES[0].minutes) return [FRAMES[0], FRAMES[0], 0];
  if (m >= FRAMES[FRAMES.length - 1].minutes)
    return [FRAMES[FRAMES.length - 1], FRAMES[FRAMES.length - 1], 0];

  for (let i = 0; i < FRAMES.length - 1; i++) {
    const a = FRAMES[i];
    const b = FRAMES[i + 1];
    if (m >= a.minutes && m <= b.minutes) {
      const span = Math.max(1, b.minutes - a.minutes);
      const t = clamp((m - a.minutes) / span, 0, 1);
      return [a, b, t];
    }
  }
  // fallback
  return [FRAMES[FRAMES.length - 1], FRAMES[FRAMES.length - 1], 0];
}

/**
 * Tick-based feed:
 * - tickMs: real time between ticks (ms)
 * - minuteStep: virtual minutes added per tick (1 => 1 sec = 1 minute)
 * - startMinute: initial minute
 * - loop: when reaching >90, restart at 0 if true
 */
export default function useFakePossessionFeed({
  tickMs = 1000,
  minuteStep = 1,
  startMinute = 0,
  loop = true,
} = {}) {
  const [minute, setMinute] = useState(startMinute);

  // Drive the virtual match clock
  useEffect(() => {
    const id = setInterval(() => {
      setMinute((m) => {
        const next = m + minuteStep;
        if (next > 90) return loop ? 0 : 90;
        return next;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs, minuteStep, loop]);

  // Derive a frame for the current minute (with interpolation)
  const frame = useMemo(() => {
    const [a, b, t] = bracketFrames(minute);
    // If only one frame applies, use it directly
    if (!a || !b) return FRAMES[0];

    const left = Math.round(lerp(a.left, b.left, t));
    const right = Math.round(lerp(a.right, b.right, t));
    // pick a team around the mid-point (optional; tweak as desired)
    const ballPossTeam = t < 0.5 ? a.ballPossTeam : b.ballPossTeam;

    return {
      left,
      right,
      minutes: minute,
      ballPossTeam,
    };
  }, [minute]);

  // Teams per half based on virtual minute
  const halfCount = minute <= 45 ? 1 : 2;
  const leftSideTeam = halfCount === 1 ? homeTeam : awayTeam;
  const rightSideTeam = halfCount === 1 ? awayTeam : homeTeam;

  const leftPossTeamPct = frame.left;
  const rightPossTeamPct = frame.right;
  const ballPossTeam = frame.ballPossTeam;

  const headerSide =
    leftPossTeamPct === rightPossTeamPct
      ? "center"
      : leftPossTeamPct > rightPossTeamPct
      ? "left"
      : "right";

  const odds = useMemo(() => STATIC_ODDS, []);

  const lastGoal = useMemo(() => {
    const past = [...GOALS].filter((g) => g.minute <= minute).pop();
    return past ? { label: "GOAL", team: past.team, minute: past.minute } : null;
  }, [minute]);

  return {
    leftSideTeam,
    rightSideTeam,
    ballPossTeam,
    leftPossTeamPct,
    rightPossTeamPct,
    headerSide,
    odds,
    lastGoal,
    frame,
    minute,          // ⚽ virtual minute (advances 1/min per second by default)
    goals: GOALS,
    homeTeam,
    awayTeam,
  };
}