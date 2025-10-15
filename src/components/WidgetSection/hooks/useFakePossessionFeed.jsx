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

export default function useFakePossessionFeed(intervalMs = 1000) {
  const [i, setI] = useState(0);

  const period = Number.isFinite(intervalMs) ? intervalMs : 1000;
  useEffect(() => {
    const id = setInterval(() => {
      setI((n) => (n + 1) % FRAMES.length);
    }, period);
    return () => clearInterval(id);
  }, [period]);

  const frame = FRAMES[i];

  const halfCount = frame.minutes <= 45 ? 1 : 2;
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
    const m = frame.minutes;
    const past = [...GOALS].filter((g) => g.minute <= m).pop();
    return past
      ? { label: "GOAL", team: past.team, minute: past.minute }
      : null;
  }, [frame.minutes]);

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
    minute: frame.minutes,
    goals: GOALS,
    homeTeam,
    awayTeam,
  };
}
