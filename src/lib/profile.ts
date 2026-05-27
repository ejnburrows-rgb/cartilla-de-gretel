export type Profile = { id: string; name: string; emoji: string };

const PROFILES_KEY = "cartilla.profiles.v1";
const ACTIVE_KEY = "cartilla.profile.active.v1";

export const DEFAULT_PROFILE: Profile = { id: "demo", name: "Demo", emoji: "🌟" };

export function loadProfiles(): Profile[] {
  if (typeof window === "undefined") return [DEFAULT_PROFILE];
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const arr = raw ? (JSON.parse(raw) as Profile[]) : [];
    return arr.length ? arr : [DEFAULT_PROFILE];
  } catch {
    return [DEFAULT_PROFILE];
  }
}

export function saveProfiles(list: Profile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
}

export function getActiveProfileId(): string {
  if (typeof window === "undefined") return DEFAULT_PROFILE.id;
  return localStorage.getItem(ACTIVE_KEY) || DEFAULT_PROFILE.id;
}

export function setActiveProfileId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
  window.dispatchEvent(new Event("cartilla:profile-change"));
}

export function getActiveProfile(): Profile {
  const list = loadProfiles();
  const id = getActiveProfileId();
  return list.find((p) => p.id === id) ?? list[0] ?? DEFAULT_PROFILE;
}

export function addProfile(name: string, emoji = "🙂"): Profile {
  const list = loadProfiles();
  const id = `p_${Date.now().toString(36)}`;
  const profile: Profile = { id, name: name.trim() || "Estudiante", emoji };
  saveProfiles([...list, profile]);
  return profile;
}

export function removeProfile(id: string) {
  if (id === DEFAULT_PROFILE.id) return;
  const list = loadProfiles().filter((p) => p.id !== id);
  saveProfiles(list);
  if (getActiveProfileId() === id) setActiveProfileId(DEFAULT_PROFILE.id);
}
