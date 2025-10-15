// overlay/components/StaticArc.jsx
export default function StaticArc({
  d,
  className,
  stroke,
  strokeWidth,
  strokeDasharray,
  opacity = 1,
}) {
  return (
    <path
      d={d}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      opacity={opacity}
    />
  );
}
