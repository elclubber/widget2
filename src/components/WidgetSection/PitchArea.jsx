import PitchSvg from "./PitchSvg";

export default function PitchArea({ leftPct, rightPct }) {
  return (
    <div className="pitch-area">
      <PitchSvg className="pitch-svg" />
      <div className="percent left">
        <span className="value">{leftPct}%</span>
      </div>
      <div className="percent right">
        <span className="value">{rightPct}%</span>
      </div>
    </div>
  );
}
