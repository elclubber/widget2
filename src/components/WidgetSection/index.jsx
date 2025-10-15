import React from "react";
import PitchArea from "../PitchArea";
import useFakePossessionFeed from "../../hooks/useFakePossessionFeed";
import OddsStrip from "../OddsStrip";
import GoalStrip from "../GoalStrip";
import MatchTimeline from "../MatchTimeline";
import { defaultPitchConfig } from "../../config/pitch.config";
import "../../assets/widget.css";

export default function WidgetSection() {
  const {
    leftSideTeam,
    rightSideTeam,
    leftPossTeamPct,
    rightPossTeamPct,
    odds,
    lastGoal,
    ballPossTeam,
    headerSide,
    frame,
    minute,
    goals,
  } = useFakePossessionFeed(1400);

  const pitchSize = defaultPitchConfig.pitchSize;
  return (
    <div className="widget-wrap">
      <div className="widget-card">
        <OddsStrip items={odds} maxWidth={pitchSize} />
        <GoalStrip lastGoal={lastGoal} maxWidth={pitchSize} />
        <PitchArea
          leftTeam={leftSideTeam}
          rightTeam={rightSideTeam}
          leftPossTeamPct={leftPossTeamPct}
          rightPossTeamPct={rightPossTeamPct}
          ballPossTeam={ballPossTeam}
          headerSide={headerSide}
          maxWidth={pitchSize}
          frame={frame}
        />
        <MatchTimeline minute={minute} goals={goals} maxWidth={pitchSize} />
      </div>
    </div>
  );
}
