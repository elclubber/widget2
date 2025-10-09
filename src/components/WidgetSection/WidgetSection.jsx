import PossessionPitch from "./PossessionPitch";
import useFakePossessionFeed from "./hooks/useFakePossessionFeed";
import OddsStrip from "./OddsStrip";
import GoalStrip from "./GoalStrip";  
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
  } = useFakePossessionFeed(1400);

  return (
    <div className="widget-wrap">
      <div className="widget-card">
        <OddsStrip items={odds} maxWidth={720} />
        <GoalStrip lastGoal={lastGoal} maxWidth={720} />
        <PossessionPitch
          leftTeam={leftSideTeam}
          rightTeam={rightSideTeam}
          leftPct={leftPossTeamPct}
          rightPct={rightPossTeamPct}
          ballPossTeam={ballPossTeam}
          headerSide={headerSide}
          maxWidth={720}
          possTick={frame}
        />
      </div>
    </div>
  );
}
