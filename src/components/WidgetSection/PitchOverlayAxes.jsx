// PitchOverlayAxes.jsx
import FootballIcon from "./FootballIcon";

/**
 * We draw in the same viewBox as PitchSvg: 0 0 278 62
 * The outer pitch trapezoid corners taken from your PitchSvg path:
 */
const TL = [48.0068, 0.721]; // top-left
const TR = [228.203, 1.58326]; // top-right
const BR = [276.485, 61.0737]; // bottom-right
const BL = [1.44922, 59.7805]; // bottom-left

// Bilinear interpolation inside the trapezoid for 0..1 normalized (u=x, v=y)
function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function quadLerp(u, v) {
  const top = lerp(TL, TR, u);
  const bot = lerp(BL, BR, u);
  const p = lerp(top, bot, v);
  return { x: p[0], y: p[1] };
}

/**
 * Draw a quadratic dotted arc between p0 and p1 in screen coords.
 * "hump" controls how high the arc bows towards the far side (smaller y).
 */
function arcPath(p0, p1, curvature = 0.35) {
  // midpoint
  const mx = (p0.x + p1.x) / 2;
  const my = (p0.y + p1.y) / 2;

  // chord vector + length
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;

  // unit normal (perpendicular)
  let nx = -dy / len;
  let ny =  dx / len;

  // push control point “up” (toward smaller y on this pitch)
  if (ny > 0) { nx = -nx; ny = -ny; }

  const k = curvature;              // 0..1 (e.g., 0.25–0.5)
  const cx = mx + nx * len * k;
  const cy = my + ny * len * k;

  return `M ${p0.x} ${p0.y} Q ${cx} ${cy} ${p1.x} ${p1.y}`;
}


export default function PitchOverlayAxes({
  /** [{x:0..100, y:0..100}, ...] in percent, lower side = y:100, far side = y:0 */
  points = [],
  showGrid = true,
  showAxes = true,
  gridStepPct = 10, // grid at every 10%
  arcHump = 9, // curvature of dotted path
  ballSize = 18,
  className = "",
}) {
  // build grid lines in the trapezoid
  const gridLines = [];
  if (showGrid) {
    for (let u = 0; u <= 100; u += gridStepPct) {
      const U = u / 100;
      const a = quadLerp(U, 0);
      const b = quadLerp(U, 1);
      gridLines.push(
        <path key={`v-${u}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />
      );
    }
    for (let v = 0; v <= 100; v += gridStepPct) {
      const V = v / 100;
      const a = quadLerp(0, V);
      const b = quadLerp(1, V);
      gridLines.push(
        <path key={`h-${v}`} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />
      );
    }
  }

  // axes (0–100%). X goes left→right along the near touchline; Y is the left slanted edge
  const x0 = quadLerp(0, 1);
  const x1 = quadLerp(1, 1);
  const y0 = quadLerp(0, 1);
  const y1 = quadLerp(0, 0);

  // convert % coords to screen coords
  const toScreen = ({ x, y }) => quadLerp(x / 100, 1 - y / 100);

  // balls + arcs
  const arcs = [];
  const balls = [];
  points.forEach((pt, i) => {
    const p = toScreen(pt);
    balls.push(
      <g
        key={`ball-${i}`}
        transform={`translate(${p.x - ballSize / 2}, ${p.y - ballSize / 2})`}
      >
        {/* Make the icon ignore pointer events so it behaves like a pure overlay */}
        <foreignObject width={ballSize} height={ballSize} pointerEvents="none">
          <div style={{ width: ballSize, height: ballSize }}>
            <FootballIcon size={ballSize} />
          </div>
        </foreignObject>
      </g>
    );
    if (i > 0) {
      const p0 = toScreen(points[i - 1]);
      arcs.push(
        <path
          key={`arc-${i - 1}-${i}`}
          d={arcPath(p0, p, arcHump)}
          strokeDasharray="4 4"
          fill="none"
          className="path-arc"
        />
      );
    }
  });

  return (
    <div className={`pitch-overlay ${className}`}>
      <svg viewBox="0 0 278 62" preserveAspectRatio="none" aria-hidden="true">
        {/* GRID */}
        {showGrid && (
          <g
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.7"
            shapeRendering="crispEdges"
          >
            {gridLines}
          </g>
        )}

        {/* AXES */}
        {showAxes && (
          <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.2">
            {/* X axis along the near (bottom) touchline */}
            <path d={`M ${x0.x} ${x0.y} L ${x1.x} ${x1.y}`} />
            {/* Y axis: left slanted edge */}
            <path d={`M ${y0.x} ${y0.y} L ${y1.x} ${y1.y}`} />
          </g>
        )}

        {/* Ticks & labels (every 20%) */}
        <g
          fill="rgba(255,255,255,0.6)"
          fontSize="4.5"
          fontFamily="system-ui, sans-serif"
        >
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

        {/* PATHS + BALLS */}
        <g stroke="rgba(255,255,255,0.75)" strokeWidth="1.8">
          {arcs}
        </g>
        {balls}
      </svg>
    </div>
  );
}
