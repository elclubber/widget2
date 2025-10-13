import React, { useEffect, useMemo, useRef, useState } from "react";
import FootballIcon from "./FootballIcon.jsx";

/**
 * Pitch quad (same trapezoid as your <PitchSvg viewBox="0 0 278 62">):
 * reading the outer field path:
 *   TL: (48.0068, 0.7212)   TR: (228.203, 1.5833)
 *   BL: ( 1.4492, 59.7805)  BR: (276.485, 61.0737)
 * Stored here as PERCENTAGES of the viewBox so we can scale to any size.
 */
const PITCH_CORNERS_PCT = {
  tl: { x: 17.2686330935, y: 1.1632112903 },
  tr: { x: 82.0874100719, y: 2.5536451613 },
  br: { x: 99.4550359712, y: 98.5059677419 },
  bl: { x: 0.5213021583, y: 96.4201612903 },
};

/** Resize observer to keep overlay responsive */
function useSize(ref) {
  const [size, set] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      set({ w: cr.width, h: cr.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return size;
}

/** Bilinear warp from (u,v) in [0..1]x[0..1] to convex quad (tl,tr,br,bl) */
function bilerp(u, v, tl, tr, br, bl) {
  const x =
    (1 - u) * (1 - v) * tl.x +
    u * (1 - v) * tr.x +
    u * v * br.x +
    (1 - u) * v * bl.x;
  const y =
    (1 - u) * (1 - v) * tl.y +
    u * (1 - v) * tr.y +
    u * v * br.y +
    (1 - u) * v * bl.y;
  return { x, y };
}

/** Make a nice arched quadratic curve between A and B */
function makeArcPath(a, b, lift = 0.18) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular (normal)
  let nx = -dy / len;
  let ny = dx / len;
  // Nudge the control point "upwards" (smaller y) regardless of segment dir
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const amp = len * lift;
  const cx = (a.x + b.x) / 2 + nx * amp;
  const cy = (a.y + b.y) / 2 + ny * amp;
  return `M ${a.x},${a.y} Q ${cx},${cy} ${b.x},${b.y}`;
}

/**
 * @param {Array<{x:number,y:number}>} points - each 0..100 (x=left→right, y=top→bottom)
 * @param {boolean} showAxes - debug axes/grid
 * @param {number} ballSize - px
 * @param {string} className
 */
export default function BallPathOverlay({
  points = [],
  showAxes = false,
  ballSize = 18,
  className = "",
}) {
  const rootRef = useRef(null);
  const { w, h } = useSize(rootRef);

  // Pixels for pitch corners (from % -> px)
  const corners = useMemo(() => {
    const toPx = (p) => ({ x: (p.x / 100) * w, y: (p.y / 100) * h });
    const { tl, tr, br, bl } = PITCH_CORNERS_PCT;
    return { tl: toPx(tl), tr: toPx(tr), br: toPx(br), bl: toPx(bl) };
  }, [w, h]);

  // Map 0..100 coords to px via the bilinear warp
  const map = (xpct, ypct) => {
    const u = Math.max(0, Math.min(1, xpct / 100));
    const v = Math.max(0, Math.min(1, ypct / 100));
    return bilerp(u, v, corners.tl, corners.tr, corners.br, corners.bl);
  };

  const ptsPx = useMemo(
    () => points.map((p) => map(p.x, p.y)),
    [points, corners]
  );

  // Build arc segments
  const paths = useMemo(() => {
    const segs = [];
    for (let i = 0; i < ptsPx.length - 1; i++) {
      segs.push(makeArcPath(ptsPx[i], ptsPx[i + 1]));
    }
    return segs;
  }, [ptsPx]);

  // Debug axes/grid
  const axes = useMemo(() => {
    if (!showAxes) return null;
    const ticks = [];
    // verticals (x = 0..100 step 10) – they appear slanted due to warp
    for (let x = 0; x <= 100; x += 10) {
      const a = map(x, 0);
      const b = map(x, 100);
      ticks.push(
        <path
          key={`vx-${x}`}
          d={`M ${a.x},${a.y} L ${b.x},${b.y}`}
          stroke="rgba(255,255,255,.15)"
          strokeWidth="1"
        />
      );
    }
    // horizontals (y = 0..100 step 10)
    for (let y = 0; y <= 100; y += 10) {
      const a = map(0, y);
      const b = map(100, y);
      ticks.push(
        <path
          key={`hx-${y}`}
          d={`M ${a.x},${a.y} L ${b.x},${b.y}`}
          stroke="rgba(255,255,255,.12)"
          strokeWidth="1"
        />
      );
    }
    // axis labels (0,0) and (100,100)
    const org = map(0, 100);
    const max = map(100, 0);
    ticks.push(
      <circle
        key="ax-dot"
        cx={org.x}
        cy={org.y}
        r="2.5"
        fill="rgba(255,255,255,.55)"
      />,
      <text
        key="ax-o"
        x={org.x + 6}
        y={org.y - 4}
        fontSize="10"
        fill="rgba(255,255,255,.7)"
      >
        0,100
      </text>,
      <text
        key="ax-m"
        x={max.x - 34}
        y={max.y + 12}
        fontSize="10"
        fill="rgba(255,255,255,.7)"
      >
        100,0
      </text>
    );
    return ticks;
  }, [showAxes, corners]);

  return (
    <div ref={rootRef} className={`pitch-overlay ${className}`}>
      {/* lines */}
      <svg className="overlay-svg" aria-hidden="true">
        <g>
          {axes}
          {paths.map((d, i) => (
            <path
              key={`seg-${i}`}
              d={d}
              fill="none"
              stroke="rgba(255,255,255,.85)"
              strokeWidth="2.2"
              strokeDasharray="5 6"
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>

      {/* icons */}
      {ptsPx.map((p, i) => (
        <div
          key={`ball-${i}`}
          className="ball-icon"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${ballSize}px`,
            height: `${ballSize}px`,
          }}
          aria-hidden="true"
        >
          <FootballIcon size={ballSize} />
        </div>
      ))}
    </div>
  );
}
