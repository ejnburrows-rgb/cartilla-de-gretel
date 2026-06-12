export type GretelState =
  | "boot"
  | "idle"
  | "blinking"
  | "talking"
  | "waving"
  | "pointing"
  | "cheering"
  | "error";

export type GretelEvent =
  | { type: "INIT" }
  | { type: "IDLE" }
  | { type: "BLINK" }
  | { type: "SPEAK_START" }
  | { type: "SPEAK_STOP" }
  | { type: "WAVE" }
  | { type: "POINT" }
  | { type: "CHEER" }
  | { type: "ASSET_ERROR" }
  | { type: "RESET" };

/**
 * Validates whether a given transition is legal according to the FSM rules.
 */
export function canTransition(from: GretelState, event: GretelEvent): boolean {
  switch (from) {
    case "boot":
      return event.type === "INIT";
    case "idle":
      return ["BLINK", "SPEAK_START", "WAVE", "POINT", "CHEER", "ASSET_ERROR"].includes(event.type);
    case "blinking":
      return ["IDLE", "ASSET_ERROR"].includes(event.type);
    case "talking":
      return ["SPEAK_STOP", "ASSET_ERROR"].includes(event.type);
    case "waving":
    case "pointing":
    case "cheering":
      return ["IDLE", "ASSET_ERROR"].includes(event.type);
    case "error":
      return ["RESET", "ASSET_ERROR"].includes(event.type);
    default:
      return false;
  }
}

/**
 * Pure reducer function for the Gretel Animation State Machine.
 * Unhandled or illegal transitions log a warning and heal to 'idle'.
 */
export function gretelReducer(state: GretelState, event: GretelEvent): GretelState {
  if (!canTransition(state, event)) {
    console.warn(`[GretelMachine] Illegal transition from '${state}' with event '${event.type}'. Healing to 'idle'.`);
    return state === "error" ? "error" : "idle";
  }

  let nextState = state;
  switch (state) {
    case "boot":
      if (event.type === "INIT") nextState = "idle";
      break;

    case "idle":
      if (event.type === "BLINK") nextState = "blinking";
      if (event.type === "SPEAK_START") nextState = "talking";
      if (event.type === "WAVE") nextState = "waving";
      if (event.type === "POINT") nextState = "pointing";
      if (event.type === "CHEER") nextState = "cheering";
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
      if (event.type === "IDLE") nextState = "idle";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;

    case "error":
      if (event.type === "RESET") nextState = "idle";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;
  }

  return nextState;
}
