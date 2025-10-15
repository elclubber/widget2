import PossessionPitch from "./PossessionPitch";
import useFakePossessionFeed from "./hooks/useFakePossessionFeed";
import OddsStrip from "./OddsStrip";
import GoalStrip from "./GoalStrip";
import MatchTimeline from "./MatchTimeline";
import "./widget.css";

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

  const pitchSize = 720;
  return (
    <div className="widget-wrap">
      <div className="widget-card">
        <OddsStrip items={odds} maxWidth={pitchSize} />
        <GoalStrip lastGoal={lastGoal} maxWidth={pitchSize} />
        <PossessionPitch
          leftTeam={leftSideTeam}
          rightTeam={rightSideTeam}
          leftPct={leftPossTeamPct}
          rightPct={rightPossTeamPct}
          ballPossTeam={ballPossTeam}
          headerSide={headerSide}
          maxWidth={pitchSize}
          possTick={frame}
        />
        <MatchTimeline minute={minute} goals={goals} maxWidth={pitchSize} />
      </div>
    </div>
  );
}
