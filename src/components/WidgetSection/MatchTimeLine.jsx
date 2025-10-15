import React, { useEffect, useMemo, useRef, useState } from "react";
import BallSvg from "./BallSvg.jsx";
import "./widget.css";

const TICKS = [0, 15, 30, 45, 60, 75, 90];

export default function MatchTimeline({
  minute = 0,
  goals = [],
  homeTeam,
  awayTeam,
  maxWidth = 720,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const [openId, setOpenId] = useState(null);
  const [spacedPins, setSpacedPins] = useState([]);

  const clamped = Math.max(0, Math.min(90, minute));
  const progressPct = (clamped / 90) * 100;

  const rawPins = useMemo(
    () =>
      goals.map((g, idx) => ({
        key: `g-${g.team}-${g.minute}-${idx}`,
        id: `goal-pop-${g.team.replace(/\W+/g, "_")}-${g.minute}-${idx}`,
        leftPct: Math.max(0, Math.min(100, (g.minute / 90) * 100)),
        ...g,
      })),
    [goals]
  );

  // Space pins horizontally if minutes are very close (so they don't overlap)
  useEffect(() => {
    const width = trackRef.current?.offsetWidth || 0;
    const minGapPct = width ? (16 / width) * 100 : 2.0; // ~16px
    const sorted = [...rawPins]
      .sort((a, b) => a.leftPct - b.leftPct)
      .map((p) => ({ ...p }));

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].leftPct - sorted[i - 1].leftPct < minGapPct) {
        sorted[i].leftPct = Math.min(100, sorted[i - 1].leftPct + minGapPct);
      }
    }
    const map = new Map(sorted.map((p) => [p.key, p.leftPct]));
    setSpacedPins(
      rawPins.map((p) => ({ ...p, leftPct: map.get(p.key) ?? p.leftPct }))
    );
  }, [rawPins, minute]);

  // Click outside to close
  useEffect(() => {
    const onDocDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpenId(null);
    };
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, []);

  return (
    <div
      className="timeline-wrap"
      style={{ "--pitch-max": `${maxWidth}px` }}
      aria-label="Match timeline"
      ref={rootRef}
    >
      <div className="timeline">
        <div className="teams">
          <div className="team home">
            <span className="dot" />
            <span className="name">{homeTeam}</span>
          </div>
          <div className="team away">
            <span className="dot" />
            <span className="name">{awayTeam}</span>
          </div>
        </div>

        <div className="ruler" aria-hidden="true">
          {TICKS.map((t) => (
            <span key={t} style={{ left: `${(t / 90) * 100}%` }}>
              {t}’
            </span>
          ))}
        </div>

        <div className="track" ref={trackRef}>
          {TICKS.map((t) => (
            <i
              key={`tick-${t}`}
              className={`tick ${t === 0 || t === 90 ? "major" : ""}`}
              style={{ left: `${(t / 90) * 100}%` }}
              aria-hidden="true"
            />
          ))}

          <div
            className="progress"
            style={{ width: `${progressPct}%` }}
            aria-label={`Minutes played ${clamped}’`}
          />

          {spacedPins.map((g) => {
            const isOpen = openId === g.id;
            return (
              <div
                key={g.key}
                className="goal-pin"
                style={{ left: `${g.leftPct}%` }}
              >
                <button
                  type="button"
                  className="goal-ball"
                  aria-expanded={isOpen}
                  aria-controls={g.id}
                  onClick={() => setOpenId(isOpen ? null : g.id)}
                  title={`Goal: ${g.team} ${g.minute}’`}
                >
                  <BallSvg size={18} color="#111" />
                </button>

                <div
                  id={g.id}
                  className={`goal-popover goal-popover--left ${
                    isOpen ? "is-open" : ""
                  }`}
                  role="dialog"
                  aria-label={`Goal ${g.team} at ${g.minute} minutes`}
                >
                  <div className="goal-pill">
                    <span className="label">GOAL</span>
                    <span className="dot" aria-hidden="true" />
                    <span className="team-name">{g.team}</span>
                    <span className="minute">{g.minute}’</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
