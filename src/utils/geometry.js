// overlay/utils/geometry.js
export function makeQuadLerp(corners) {
  const { TL, TR, BL, BR } = corners;
  const lerp2 = (a, b, t) => [a[0] + (b[0]-a[0]) * t, a[1] + (b[1]-a[1]) * t];
  return (u, v) => {
    const top = lerp2(TL, TR, u);
    const bot = lerp2(BL, BR, u);
    const p = lerp2(top, bot, v);
    return { x: p[0], y: p[1] };
  };
}

export function makeToScreen(quadLerp) {
  return ({ x, y }) => quadLerp(x / 100, 1 - y / 100);
}

export function makeRoundedArcPath(pathBulge) {
  return (p0, p1) => {
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    let nx = -uy, ny = ux;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const h = len * pathBulge;
    const c1x = p0.x + ux * (len/3) + nx*h;
    const c1y = p0.y + uy * (len/3) + ny*h;
    const c2x = p0.x + ux * (2*len/3) + nx*h;
    const c2y = p0.y + uy * (2*len/3) + ny*h;
    return `M ${p0.x} ${p0.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${p1.x} ${p1.y}`;
  };
}
