// PitchOverlayAxes.jsx
import BallSvg from "./BallSvg";

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
 * Rounded (semi-circle-ish) arc between p0 and p1 using a cubic Bézier.
 * bulge: 0..1 – how round/high the arc is (try 0.45–0.70).
 */
function roundedArcPath(p0, p1, bulge = 0.55) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;

  // unit direction along chord and its perpendicular
  const ux = dx / len;
  const uy = dy / len;
  let nx = -uy;  // perpendicular
  let ny =  ux;

  // bow “upfield” (toward smaller y on this pitch)
  if (ny > 0) { nx = -nx; ny = -ny; }

  // control points at 1/3 and 2/3 along the chord, offset by the same height
  const h = len * bulge;             // arc height; increase for more “semi-round”
  const c1x = p0.x + ux * (len / 3) + nx * h;
  const c1y = p0.y + uy * (len / 3) + ny * h;
  const c2x = p0.x + ux * (2 * len / 3) + nx * h;
  const c2y = p0.y + uy * (2 * len / 3) + ny * h;

  return `M ${p0.x} ${p0.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${p1.x} ${p1.y}`;
}

export default function PitchOverlayAxes({
  points,
  showGrid,
  showAxes,
  gridStepPct,
  ballSize,
  className,
}) {
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

  const x0 = quadLerp(0, 1);
  const x1 = quadLerp(1, 1);
  const y0 = quadLerp(0, 1);
  const y1 = quadLerp(0, 0);

  const toScreen = ({ x, y }) => quadLerp(x / 100, 1 - y / 100);

const arcs = [];
const balls = [];
points.forEach((pt, i) => {
  const p = toScreen(pt);
  balls.push(
    <g
      key={`ball-${i}`}
      transform={`translate(${p.x - ballSize / 5}, ${p.y - ballSize / 20})`}
    >
      <BallSvg size={ballSize / 2.6} />
      </g>
  );
  if (i > 0) {
    const p0 = toScreen(points[i - 1]);
    arcs.push(
      <path
        key={`arc-${i - 1}-${i}`}
        d={roundedArcPath(p0, p, 0.55)}
        strokeDasharray="6 8"
        fill="none"
        className="path-arc"
      />
    );
  }
});

  return (
    <div className={`pitch-overlay ${className}`}>
      <svg viewBox="0 0 278 62" preserveAspectRatio="none" aria-hidden="true" className="overlay-surface">
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
