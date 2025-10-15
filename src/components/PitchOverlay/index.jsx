import GoalAnimation from "../GoalAnimation";
import PossessionPercentage from "./PossessionPercentage";
import { defaultPitchConfig } from "../../config/pitchOverlay.config";

export default function PitchOverlay({
  goals,
  minute,
  leftPossTeamPct,
  rightPossTeamPct,
}) {
    return (
        <>
          <GoalAnimation
            goals={goals}
            minute={minute}
            config={defaultPitchConfig}
          />
          <PossessionPercentage
            leftPossTeamPct={leftPossTeamPct}
            rightPossTeamPct={rightPossTeamPct}
          />
        </>
    );
}