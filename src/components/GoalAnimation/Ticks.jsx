// overlay/components/Ticks.jsx
export default function Ticks({ quadLerp, fontSize, fill }) {
  return (
    <g fill={fill} fontSize={fontSize} fontFamily="system-ui, sans-serif">
      {[0, 20, 40, 60, 80, 100].map((u) => {
        const p = quadLerp(u / 100, 1);
        return (
          <text key={`xt-${u}`} x={p.x} y={p.y + 4} textAnchor="middle">
            {u}%
          </text>
        );
      })}
      {[0, 20, 40, 60, 80, 100].map((v) => {
        const p = quadLerp(0, 1 - v / 100);
        return (
          <text key={`yt-${v}`} x={p.x - 4} y={p.y} textAnchor="end">
            {v}%
          </text>
        );
      })}
    </g>
  );
}
