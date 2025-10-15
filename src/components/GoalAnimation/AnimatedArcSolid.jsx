// overlay/components/AnimatedArcSolid.jsx
import { useEffect, useRef } from "react";

export default function AnimatedArcSolid({
  d,
  durationMs,
  className,
  animateKey,
  stroke,
  strokeWidth,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const L = el.getTotalLength();
    el.style.transition = "none";
    el.style.strokeDasharray = `${L}`;
    el.style.strokeDashoffset = `${L}`;
    requestAnimationFrame(() => {
      el.style.transition = `stroke-dashoffset ${durationMs}ms linear`;
      el.style.strokeDashoffset = "0";
    });
  }, [d, durationMs, animateKey]);

  return (
    <path
      ref={ref}
      d={d}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}
