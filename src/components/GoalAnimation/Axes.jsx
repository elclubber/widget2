// overlay/components/Axes.jsx
export default function Axes({ x0, x1, y0, y1, stroke, strokeWidth }) {
  return (
    <g stroke={stroke} strokeWidth={strokeWidth}>
      <path d={`M ${x0.x} ${x0.y} L ${x1.x} ${x1.y}`} />
      <path d={`M ${y0.x} ${y0.y} L ${y1.x} ${y1.y}`} />
    </g>
  );
}
