import React from "react";
import "../../assets/pitchHeader.css";

export default function Badge({ side, show, team, frame }) {
  return (
    <div
      className={`pitch-badge ${side} ${show ? "" : "ghost"}`}
      key={show ? `pitch-${side}-${frame}` : undefined}
    >
      {show && (
        <>
          <span className="pitch-title">Ball possession</span>
          <div className="pitch-team">
            <span className="dot" />
            <span className="team-name">{team}</span>
          </div>
        </>
      )}
    </div>
  );
} 