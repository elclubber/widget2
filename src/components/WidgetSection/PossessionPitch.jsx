// PossessionPitch.jsx
import React, { useMemo } from "react";
import PitchSvg from "./PitchSvg";
import PossessionHeader from "./PossessionHeader";
import PitchOverlayAxes from "./PitchOverlayAxes";
import "./widget.css";

export default function PossessionPitch({
  leftTeam,
  rightTeam,
  leftPct,
  rightPct,
  maxWidth = 720,
  possTick,
}) {
  const sideInPossession = useMemo(() => {
    if (leftPct === rightPct) return "center";
    return leftPct > rightPct ? "left" : "right";
  }, [leftPct, rightPct]);

  const teamInPossession =
    sideInPossession === "left" ? leftTeam :
    sideInPossession === "right" ? rightTeam : "";

  // Example three-point path (x%, y%), y=100 is near (bottom), y=0 is far (top)
  const demoPoints = [
    { x: 35, y: 55 },
    { x: 72, y: 42 },
    { x: 88, y: 30 },
  ];

  return (
    <div className="poss-wrap" style={{ "--pitch-max": `${maxWidth}px` }}>
      <PossessionHeader side={sideInPossession} team={teamInPossession} tick={possTick} />

      <div className="pitch-area">
        <PitchSvg className="pitch-svg" />

        {/* NEW: overlay sits on top and fills the same box */}
        <PitchOverlayAxes
          showGrid
          showAxes
          points={demoPoints}     // replace with actual coordinates
          gridStepPct={10}
          arcHump={0.6}
          ballSize={18}
        />

        <div className="percent left"><span className="value">{leftPct}%</span></div>
        <div className="percent right"><span className="value">{rightPct}%</span></div>
      </div>
    </div>
  );
}
