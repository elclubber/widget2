// overlay/components/Balls.jsx
import BallSvg from "../../assets/BallSvg";

export default function Balls({ points, shownCount, ballSize, stamp }) {
  if (!points?.length) return null;
  const balls = [];
  for (let i = 0; i < Math.min(shownCount, points.length); i++) {
    const p = points[i];
    balls.push(
      <g
        key={`ball-${i}-${stamp}`}
        transform={`translate(${p.x - ballSize / 5}, ${p.y - ballSize / 20})`}
      >
        <BallSvg size={ballSize / 2.6} />
      </g>
    );
  }
  return <>{balls}</>;
}
