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
      return event.type === "IDLE";
    case "talking":
      return ["SPEAK_STOP", "ASSET_ERROR"].includes(event.type);
    case "waving":
    case "pointing":
    case "cheering":
      return ["IDLE", "ASSET_ERROR"].includes(event.type);
    case "error":
      return event.type === "RESET";
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
    return "idle";
  }

  switch (state) {
    case "boot":
      if (event.type === "INIT") return "idle";
      break;

    case "idle":
      if (event.type === "BLINK") return "blinking";
      if (event.type === "SPEAK_START") return "talking";
      if (event.type === "WAVE") return "waving";
      if (event.type === "POINT") return "pointing";
      if (event.type === "CHEER") return "cheering";
      if (event.type === "ASSET_ERROR") return "error";
      break;

    case "blinking":
      if (event.type === "IDLE") return "idle";
      break;

    case "talking":
      if (event.type === "SPEAK_STOP") return "idle";
      if (event.type === "ASSET_ERROR") return "error";
      break;

    case "waving":
    case "pointing":
    case "cheering":
      if (event.type === "IDLE") return "idle";
      if (event.type === "ASSET_ERROR") return "error";
      break;

    case "error":
      if (event.type === "RESET") return "idle";
      break;
  }

  // Fallback (should be unreachable given canTransition check)
  return state;
}
