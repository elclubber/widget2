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
          pathPoints={[
            { x: 40, y: 62 },
            { x: 70, y: 40 },
            { x: 92, y: 34 },
          ]}
          showAxes={true}
        />
        <MatchTimeline minute={minute} goals={goals} maxWidth={720} />
      </div>
    </div>
  );
}
