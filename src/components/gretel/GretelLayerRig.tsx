import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";

/** Keep the existing host API and state machine; display the approved still intact. */
export function GretelLayerRig({ state, speaking = false, onError }: {
  state: string;
  pointingLeft?: boolean;
  speaking?: boolean;
  paused?: boolean;
  onError?: () => void;
}) {
  return <svg viewBox="0 0 1061 1450" role="img" aria-label="Gretel"
    className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_8px_rgba(45,32,20,0.20)]"
    data-gretel-rig="svg" data-gretel-rig-state={state}
    data-gretel-rig-speaking={speaking ? "true" : "false"}>
    <image data-rig-part="head" data-approved-master="true" href={GRETEL_APPROVED_MASTER_SRC}
      x="0" y="0" width="1061" height="1450" preserveAspectRatio="xMidYMid meet" onError={onError} />
  </svg>;
}
