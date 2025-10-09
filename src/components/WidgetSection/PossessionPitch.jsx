import React, { useMemo } from "react";
import PitchSvg from "./PitchSvg";
import PossessionHeader from "./PossessionHeader";
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

  return (
    <div className="poss-wrap" style={{ "--pitch-max": `${maxWidth}px` }}>
      <PossessionHeader side={sideInPossession} team={teamInPossession} tick={possTick} />

      <div className="pitch-area">
        <PitchSvg className="pitch-svg" />
        <div className="percent left"><span className="value">{leftPct}%</span></div>
        <div className="percent right"><span className="value">{rightPct}%</span></div>
      </div>
    </div>
  );
}
