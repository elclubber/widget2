import React from "react";
import "../../assets/pitchHeader.css";
import Badge from "./Badge";

export default function PitchHeader({ side, team, frame }) {
  const show = {
    left: side === "left",
    right: side === "right",
  };

  return (
    <div className="pitch-header" role="status" aria-live="polite">
      {["left", "right"].map((s) => (
        <Badge key={s} side={s} show={show[s]} team={team} frame={frame} />
      ))}
    </div>
  );
}