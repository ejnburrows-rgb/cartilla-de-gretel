export type GretelState =
  | "boot"
  | "settling"
  | "idle"
  | "blinking"
  | "talking"
  | "waving"
  | "pointing"
  | "exiting"
  | "cheering"
  | "error";

export type GretelEvent =
  | { type: "INIT" }
  | { type: "IDLE" }
  | { type: "SETTLE" }
  | { type: "BLINK" }
  | { type: "SPEAK_START" }
  | { type: "SPEAK_STOP" }
  | { type: "WAVE" }
  | { type: "POINT" }
  | { type: "CHEER" }
  | { type: "EXIT" }
  | { type: "ASSET_ERROR" }
  | { type: "RESET" };

export function canTransition(from: GretelState, event: GretelEvent): boolean {
  if (from !== "boot" && from !== "error" && ["EXIT", "SETTLE", "SPEAK_START"].includes(event.type)) return true;
  switch (from) {
    case "boot":
      return event.type === "INIT";
    case "settling":
      return ["IDLE", "ASSET_ERROR"].includes(event.type);
    case "idle":
      return ["BLINK", "SETTLE", "SPEAK_START", "WAVE", "POINT", "CHEER", "EXIT", "ASSET_ERROR"].includes(event.type);
    case "blinking":
      return ["IDLE", "ASSET_ERROR"].includes(event.type);
    case "talking":
      return ["SPEAK_STOP", "ASSET_ERROR"].includes(event.type);
    case "waving":
    case "pointing":
    case "cheering":
    case "exiting":
      return ["IDLE", "SETTLE", "ASSET_ERROR", "SPEAK_START", "SPEAK_STOP"].includes(event.type);
    case "error":
      return ["RESET", "ASSET_ERROR"].includes(event.type);
    default:
      return false;
  }
}

/** Pure reducer for Gretel's pose state. Speech always wins over a transient
 * gesture so her mouth frames follow real audio instead of freezing in a
 * wave/point/cheer while the voice is playing. */
export function gretelReducer(state: GretelState, event: GretelEvent): GretelState {
  if (!canTransition(state, event)) {
    console.warn(
      `[GretelMachine] Illegal transition from '${state}' with event '${event.type}'. Healing to 'idle'.`,
    );
    return state === "error" ? "error" : "idle";
  }

  if (state !== "boot" && state !== "error") {
    if (event.type === "EXIT") return "exiting";
    if (event.type === "SETTLE") return "settling";
    if (event.type === "SPEAK_START") return "talking";
  }
  let nextState = state;
  switch (state) {
    case "boot":
      if (event.type === "INIT") nextState = "settling";
      break;
    case "settling":
      if (event.type === "IDLE") nextState = "idle";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;
    case "idle":
      if (event.type === "BLINK") nextState = "blinking";
      if (event.type === "SETTLE") nextState = "settling";
      if (event.type === "SPEAK_START") nextState = "talking";
      if (event.type === "WAVE") nextState = "waving";
      if (event.type === "POINT") nextState = "pointing";
      if (event.type === "CHEER") nextState = "cheering";
      if (event.type === "EXIT") nextState = "exiting";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;
    case "blinking":
      if (event.type === "IDLE") nextState = "idle";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;
    case "talking":
      if (event.type === "SPEAK_STOP") nextState = "idle";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;
    case "waving":
    case "pointing":
    case "cheering":
    case "exiting":
      if (event.type === "SETTLE") nextState = "settling";
      else if (event.type === "SPEAK_START") nextState = "talking";
      else if (event.type === "SPEAK_STOP" || event.type === "IDLE") nextState = "idle";
      else if (event.type === "ASSET_ERROR") nextState = "error";
      break;
    case "error":
      if (event.type === "RESET") nextState = "idle";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;
  }
  return nextState;
}
