// Manual lesson-completion overrides — a teacher-driven "mark this lesson
// done" grid. This is LOCAL-ONLY (localStorage) on purpose: it is a manual
// override layer a teacher toggles by hand, distinct from the automatic,
// Supabase-backed progress that students generate as they work.
//
// It lives in lib/ (not services/) precisely because it makes no Supabase
// calls — the services/ = Supabase-only convention would be violated if it
// sat there. When the Tree B CRM grows a real Supabase-backed manual-override
// feature, this module is the building block to port (getAllProgresos /
// toggleLeccion), at which point the localStorage backing can be swapped for
// a server round-trip.
//
// Trimmed from the retired legacy crm.ts: the group/student CRUD helpers
// (getGrupos/getGrupo/createGrupo/addAlumno/removeAlumno/getProgreso) are
// gone — student/class data is owned by Supabase via src/services/, not here.

export interface Progreso {
  alumnoId: string;
  leccionesCompletadas: number[];
}

const STORAGE_KEY = "cartilla.crm.data.v2";

interface ManualProgressState {
  progresos: Progreso[];
}

function loadState(): ManualProgressState {
  if (typeof window === "undefined") return { progresos: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { progresos: parsed.progresos ?? [] };
    }
  } catch (e) {
    console.error("Error loading manual-progress state", e);
  }
  return { progresos: [] };
}

function saveState(state: ManualProgressState) {
  if (typeof window === "undefined") return;
  // Preserve any unrelated keys already in storage (e.g. legacy grupos) so a
  // partial write here doesn't clobber data this module no longer manages.
  let existing: Record<string, unknown> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch {
    existing = {};
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, progresos: state.progresos }));
  window.dispatchEvent(new Event("cartilla-crm-updated"));
}

export const manualProgress = {
  getAllProgresos: () => loadState().progresos,
  toggleLeccion: (alumnoId: string, leccion: number) => {
    const state = loadState();
    let p = state.progresos.find((x) => x.alumnoId === alumnoId);
    if (!p) {
      p = { alumnoId, leccionesCompletadas: [] };
      state.progresos.push(p);
    }
    if (p.leccionesCompletadas.includes(leccion)) {
      p.leccionesCompletadas = p.leccionesCompletadas.filter((l) => l !== leccion);
    } else {
      p.leccionesCompletadas.push(leccion);
    }
    saveState(state);
    return p;
  },
};
