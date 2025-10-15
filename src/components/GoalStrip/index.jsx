
export default function GoalStrip({ lastGoal, maxWidth = 720 }) {
  const hasGoal = Boolean(lastGoal);
  const pillKey = hasGoal ? `goal-${lastGoal.team}-${lastGoal.minute}` : "goal-empty";

  return (
    <div className="goal-strip">
      <div className="goal-row" style={{ "--pitch-max": `${maxWidth}px` }}>
        <div className={`goal-pill ${hasGoal ? "is-enter" : "ghost"}`} key={pillKey}>
          {hasGoal && (
            <>
              <span className="label">GOAL</span>
              <span className="dot" aria-hidden="true"></span>
              <span className="team-name">{lastGoal.team}</span>
              <span className="minute">{`${lastGoal.minute}’`}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}