export type TeacherHandMode = "left" | "right";

const HAND_MODE_KEY = "cartilla:teacher:hand-mode";

export function getTeacherHandMode(): TeacherHandMode {
  if (typeof window === "undefined") return "left";
  try {
    const val = localStorage.getItem(HAND_MODE_KEY);
    if (val === "right") return "right";
    return "left";
  } catch {
    return "left";
  }
}

export function setTeacherHandMode(mode: TeacherHandMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HAND_MODE_KEY, mode);
    window.dispatchEvent(new CustomEvent("cartilla:teacher-hand-mode", { detail: mode }));
  } catch {
    /* ignore */
  }
}
