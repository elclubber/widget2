// overlay/components/Grid.jsx
export default function Grid({ lines, stroke, strokeWidth }) {
  if (!lines?.length) return null;
  return (
    <g stroke={stroke} strokeWidth={strokeWidth} shapeRendering="crispEdges">
      {lines.map(({ d, key }) => <path key={key} d={d} />)}
    </g>
  );
}
