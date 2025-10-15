// overlay/components/Paths.jsx
import StaticArc from "./StaticArc";
import AnimatedArcSolid from "./AnimatedArcSolid";

export default function Paths({
  arcDs,
  activeStamp,
  animatingPathIndex,
  completedPathCount,
  strokeColor,
  staticStrokeWidth,
  animStrokeWidth,
  staticDasharray,
  staticPathClass,
  animPathClass,
  animGhostOpacity,
  completedOpacity,
  stepMs,
}) {
  const nodes = [];

  // Completed + ghost dashed path for the currently animating segment
  for (let i = 0; i < arcDs.length; i++) {
    const isCompleted = i < completedPathCount;
    const isCurrentAnim = i === animatingPathIndex;
    if (isCompleted || isCurrentAnim) {
      nodes.push(
        <StaticArc
          key={`arc-static-${i}-${activeStamp}`}
          d={arcDs[i]}
          className={staticPathClass}
          stroke={strokeColor}
          strokeWidth={staticStrokeWidth}
          strokeDasharray={staticDasharray}
          opacity={isCurrentAnim && !isCompleted ? animGhostOpacity : completedOpacity}
        />
      );
    }
  }

  // Current animated (solid)
  if (animatingPathIndex >= 0 && animatingPathIndex < arcDs.length) {
    nodes.push(
      <AnimatedArcSolid
        key={`arc-anim-${animatingPathIndex}-${activeStamp}-${completedPathCount}`}
        d={arcDs[animatingPathIndex]}
        durationMs={stepMs}
        className={animPathClass}
        animateKey={`${activeStamp}-${completedPathCount}`}
        stroke={strokeColor}
        strokeWidth={animStrokeWidth}
      />
    );
  }

  return <>{nodes}</>;
}
