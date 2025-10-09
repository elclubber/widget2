export default function PossHeader({ side, team, tick }) {
  const showLeft = side === "left";
  const showRight = side === "right";

  return (
    <div className="poss-header" role="status" aria-live="polite">
      <div
        className={`poss-badge left ${showLeft ? "" : "ghost"}`}
        key={showLeft ? `poss-left-${tick}` : undefined}
      >
        {showLeft && (
          <>
            <span className="poss-title">Ball Possession</span>
            <div className="poss-team">
              <span className="dot" />
              <span className="team-name">{team}</span>
            </div>
          </>
        )}
      </div>

      <div
        className={`poss-badge right ${showRight ? "" : "ghost"}`}
        key={showRight ? `poss-right-${tick}` : undefined}
      >
        {showRight && (
          <>
            <span className="poss-title">Ball Possession</span>
            <div className="poss-team">
              <span className="dot" />
              <span className="team-name">{team}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
