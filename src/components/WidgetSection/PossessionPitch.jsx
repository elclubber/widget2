// PossessionPitch.jsx
import React, { useMemo } from "react";
import PitchSvg from "./PitchSvg";
import PossessionHeader from "./PossessionHeader";
import PitchOverlayAxes from "./PitchOverlayAxes";
import useFakePossessionFeed from "./hooks/useFakePossessionFeed";
import "./widget.css";

export default function PossessionPitch({
  leftTeam,
  rightTeam,
  leftPct,
  rightPct,
  maxWidth,
  possTick,
}) {
  const sideInPossession = useMemo(() => {
    if (leftPct === rightPct) return "center";
    return leftPct > rightPct ? "left" : "right";
  }, [leftPct, rightPct]);

  const teamInPossession =
    sideInPossession === "left" ? leftTeam :
    sideInPossession === "right" ? rightTeam : "";

  const { goals } = useFakePossessionFeed(1000);
  const goalPoints = useMemo(
    () => goals.map(({ x, y }) => ({ x, y })),
    [goals]
  );

  return (
    <div className="poss-wrap" style={{ "--pitch-max": `${maxWidth}px` }}>
      <PossessionHeader side={sideInPossession} team={teamInPossession} tick={possTick} />

      <div className="pitch-area">
        <PitchSvg className="pitch-svg" />
        <PitchOverlayAxes
          showGrid
          showAxes
          points={goalPoints}
          gridStepPct={10}
          arcHump={1}
          ballSize={18}
          className={""}
        />

        <div className="percent left"><span className="value">{leftPct}%</span></div>
        <div className="percent right"><span className="value">{rightPct}%</span></div>
      </div>
    </div>
  );
}
