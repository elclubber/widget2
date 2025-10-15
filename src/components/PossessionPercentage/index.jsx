// PossPercentage.jsx
export default function PossPercentage({ leftPossTeamPct, rightPossTeamPct }) {
  return (
    <div className="poss-percentage">
      <div className="percent left">
        <span className="value">{leftPossTeamPct}%</span>
      </div>
      <div className="percent right">
        <span className="value">{rightPossTeamPct}%</span>
      </div>
    </div>
  );
}
