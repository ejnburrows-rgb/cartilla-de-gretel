export type GretelState =
  | "boot"
  | "settling"
  | "idle"
  | "blinking"
  | "talking"
  | "waving"
  | "pointing"
  | "listening"
  | "teaching"
  | "help"
  | "gentle-error"
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
  | { type: "LISTEN" }
  | { type: "TEACH" }
  | { type: "HELP" }
  | { type: "GENTLE_ERROR" }
  | { type: "CHEER" }
  | { type: "EXIT" }
  | { type: "ASSET_ERROR" }
  | { type: "RESET" };

const GLOBAL_EVENTS = new Set<GretelEvent["type"]>(["EXIT", "SETTLE", "SPEAK_START"]);

export function canTransition(from: GretelState, event: GretelEvent): boolean {
  if (from !== "boot" && from !== "error" && GLOBAL_EVENTS.has(event.type)) return true;
  switch (from) {
    case "boot":
      return event.type === "INIT";
    case "settling":
      return ["IDLE", "WAVE", "ASSET_ERROR"].includes(event.type);
    case "idle":
      return [
        "BLINK",
        "SETTLE",
        "SPEAK_START",
        "WAVE",
        "POINT",
        "LISTEN",
        "TEACH",
        "HELP",
        "GENTLE_ERROR",
        "CHEER",
        "EXIT",
        "ASSET_ERROR",
      ].includes(event.type);
    case "blinking":
      return ["IDLE", "ASSET_ERROR"].includes(event.type);
    case "talking":
      return ["SPEAK_STOP", "ASSET_ERROR"].includes(event.type);
    case "waving":
    case "pointing":
    case "listening":
    case "teaching":
    case "help":
    case "gentle-error":
    case "cheering":
    case "exiting":
      if (from === "waving" && event.type === "WAVE") return true;
      return ["IDLE", "SETTLE", "ASSET_ERROR", "SPEAK_START", "SPEAK_STOP"].includes(event.type);
    case "error":
      return ["RESET", "ASSET_ERROR"].includes(event.type);
    default:
      return false;
  }
}

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
      if (event.type === "WAVE") nextState = "waving";
      if (event.type === "ASSET_ERROR") nextState = "error";
      break;
    case "idle":
      if (event.type === "BLINK") nextState = "blinking";
      if (event.type === "WAVE") nextState = "waving";
      if (event.type === "POINT") nextState = "pointing";
      if (event.type === "LISTEN") nextState = "listening";
      if (event.type === "TEACH") nextState = "teaching";
      if (event.type === "HELP") nextState = "help";
      if (event.type === "GENTLE_ERROR") nextState = "gentle-error";
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
    case "listening":
    case "teaching":
    case "help":
    case "gentle-error":
    case "cheering":
    case "exiting":
      if (state === "waving" && event.type === "WAVE") nextState = "waving";
      else if (event.type === "SETTLE") nextState = "settling";
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
