import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Map unit-square (0..1,0..1) -> arbitrary quad via projective homography.
 * H is [a,b,c,d,e,f,g,h] with implicit i=1 in the matrix:
 * [a b c; d e f; g h 1]
 */
function computeHomography(src, dst) {
  // src/dst each: [{x,y}, ... 4]
  // Solve A*h = b (8 unknowns: a..h, fix i=1)
  const A = [];
  const B = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: X, y: Y } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
    B.push(X);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
    B.push(Y);
  }
  const h = solveLinearSystem(A, B); // returns [a..h]
  return h;
}

function solveLinearSystem(A, B) {
  // Simple Gauss-Jordan elimination (8x8)
  const n = B.length;
  // augment
  const M = A.map((row, i) => [...row, B[i]]);
  for (let col = 0, row = 0; col < n && row < n; col++, row++) {
    // find pivot
    let best = row;
    for (let r = row + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[best][col])) best = r;
    }
    if (Math.abs(M[best][col]) < 1e-12) continue;
    // swap
    [M[row], M[best]] = [M[best], M[row]];
    // normalize
    const pivot = M[row][col];
    for (let c = col; c <= n; c++) M[row][c] /= pivot;
    // eliminate
    for (let r = 0; r < n; r++) {
      if (r === row) continue;
      const factor = M[r][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[row][c];
    }
  }
  return M.map((r) => r[n]);
}

function applyHomography(h, x, y) {
  const [a, b, c, d, e, f, g, hh] = h;
  const X = (a * x + b * y + c) / (g * x + hh * y + 1);
  const Y = (d * x + e * y + f) / (g * x + hh * y + 1);
  return { x: X, y: Y };
}

/** Utility: vector helpers for tick offsets & text orientation */
const sub = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });
const len = (v) => Math.hypot(v.x, v.y) || 1;
const norm = (v) => {
  const L = len(v);
  return { x: v.x / L, y: v.y / L };
};
const perp = (v) => ({ x: -v.y, y: v.x });

/**
 * PitchAxes
 *
 * Props:
 * - imgSrc: the pitch image URL (or leave null if you already render the pitch yourself and just want the overlay)
 * - corners: { tl:[x%,y%], tr:[x%,y%], br:[x%,y%], bl:[x%,y%] } positions of the 4 pitch corners in the image box
 *            (percentages 0..100 of the container width/height)
 * - showGrid: optional faint 10% grid inside the pitch (default false)
 */
export default function PitchAxes({
  imgSrc,
  corners = {
    // Reasonable defaults for a 3/4 pitch like your screenshot — tweak once to match.
    tl: [6, 26],
    tr: [94, 26],
    br: [99, 93],
    bl: [1, 93],
  },
  showGrid = false,
  style = {},
}) {
  const wrapRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (r) setBox({ w: r.width, h: r.height });
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Build homography mapping (unit-square -> pitch quad in pixels)
  const H = useMemo(() => {
    const dst = ["tl", "tr", "br", "bl"].map((k) => {
      const [px, py] = corners[k];
      return { x: (px / 100) * box.w, y: (py / 100) * box.h };
    });
    const src = [
      { x: 0, y: 0 }, // top-left of normalized pitch (x=0,y=0)
      { x: 1, y: 0 }, // top-right
      { x: 1, y: 1 }, // bottom-right
      { x: 0, y: 1 }, // bottom-left
    ];
    return computeHomography(src, dst);
  }, [box.w, box.h, corners]);

  // Convenience: map 0..100 % to pixels
  const mapXY = (xPct, yPct) => applyHomography(H, xPct / 100, yPct / 100);

  // Axis lines (source lines map to straight lines in target)
  const x0 = mapXY(0, 50),
    x1 = mapXY(100, 50); // X-axis through the pitch center
  const y0 = mapXY(50, 0),
    y1 = mapXY(50, 100); // Y-axis (center line), tilted by perspective

  const xAxisDir = norm(sub(x1, x0));
  const yAxisDir = norm(sub(y1, y0));
  const xNormal = perp(xAxisDir);
  const yNormal = perp(yAxisDir);

  // Build ticks every 10%
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  const tickElems = (
    <>
      {/* X-axis ticks & labels */}
      {ticks.map((t) => {
        const a = mapXY(t, 50 - 1.5);
        const b = mapXY(t, 50 + 1.5);
        const labelPos = mapXY(t, 50);
        const lp = {
          x: labelPos.x + xNormal.x * 16,
          y: labelPos.y + xNormal.y * 16,
        };
        return (
          <g key={`tx-${t}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1"
            />
            <text
              x={lp.x}
              y={lp.y}
              fontSize="10"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
              paintOrder="stroke"
              style={{ stroke: "rgba(0,0,0,0.45)", strokeWidth: 2 }}
            >
              {t}%
            </text>
          </g>
        );
      })}

      {/* Y-axis ticks & labels */}
      {ticks.map((t) => {
        const a = mapXY(50 - 1.5, t);
        const b = mapXY(50 + 1.5, t);
        const labelPos = mapXY(50, t);
        const lp = {
          x: labelPos.x - yNormal.x * 18,
          y: labelPos.y - yNormal.y * 18,
        };
        return (
          <g key={`ty-${t}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1"
            />
            <text
              x={lp.x}
              y={lp.y}
              fontSize="10"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
              paintOrder="stroke"
              style={{ stroke: "rgba(0,0,0,0.45)", strokeWidth: 2 }}
            >
              {t}%
            </text>
          </g>
        );
      })}
    </>
  );

  // Optional faint 10% grid
  const gridElems = showGrid ? (
    <>
      {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((t) => {
        const a = mapXY(t, 0),
          b = mapXY(t, 100);
        const c = mapXY(0, t),
          d = mapXY(100, t);
        return (
          <g key={`g-${t}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
            <line
              x1={c.x}
              y1={c.y}
              x2={d.x}
              y2={d.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
          </g>
        );
      })}
    </>
  ) : null;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt="Pitch"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      )}

      {/* SVG overlay */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {/* Axes */}
        <line
          x1={x0.x}
          y1={x0.y}
          x2={x1.x}
          y2={x1.y}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
        />
        <line
          x1={y0.x}
          y1={y0.y}
          x2={y1.x}
          y2={y1.y}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
        />

        {/* Ticks + labels */}
        {tickElems}

        {/* Optional internal grid */}
        {gridElems}
      </svg>
    </div>
  );
}

/**
 * You can import PitchAxes and also re-use `mapXY` by pulling it out into a ref if needed.
 * For animating a ball, keep a ref to the SVG and draw a circle at mapXY(x,y) over time.
 */
