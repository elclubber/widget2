// PitchSection.jsx
import React, { useMemo } from "react";
import PitchSvg from "../../assets/PitchSvg";
import PitchHeader from "./PitchHeader";
import PossessionPercentage from "../PossessionPercentage";
import GoalAnimation from "../GoalAnimation";
import useFakePossessionFeed from "../../hooks/useFakePossessionFeed";
import { defaultPitchConfig } from "../../config/pitch.config";
import "../../assets/pitchHeader.css";

export default function PitchArea({
  leftTeam,
  rightTeam,
  leftPossTeamPct,
  rightPossTeamPct,
  maxWidth,
  frame,
}) {
  const sideInPossession = useMemo(() => {
    if (leftPossTeamPct === rightPossTeamPct) return "center";
    return leftPossTeamPct > rightPossTeamPct ? "left" : "right";
  }, [leftPossTeamPct, rightPossTeamPct]);

  const teamInPossession =
    sideInPossession === "left" ? leftTeam :
    sideInPossession === "right" ? rightTeam : "";

  const { goals, minute } = useFakePossessionFeed(1000);

  return (
    <div className="pitch-wrap" style={{ "--pitch-max": `${maxWidth}px` }}>
      <PitchHeader side={sideInPossession} team={teamInPossession} frame={frame} />
      <div className="pitch-area">
        <PitchSvg className="pitch-svg" />
        <GoalAnimation
          goals={goals}
          minute={minute}
          config={defaultPitchConfig}
        />
        <PossessionPercentage leftPossTeamPct={leftPossTeamPct} rightPossTeamPct={rightPossTeamPct} />
      </div>
    </div>
  );
}
