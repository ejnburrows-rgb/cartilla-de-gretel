export interface Alumno {
  id: string;
  nombre: string;
  avatar?: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  color: string;
  alumnos: Alumno[];
}

export interface Progreso {
  alumnoId: string;
  leccionesCompletadas: number[];
}

const STORAGE_KEY = "cartilla.crm.data.v2";

interface CrmState {
  grupos: Grupo[];
  progresos: Progreso[];
}

function loadState(): CrmState {
  if (typeof window === "undefined") return { grupos: [], progresos: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading CRM state", e);
  }
  return { grupos: [], progresos: [] };
}

function saveState(state: CrmState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("cartilla-crm-updated"));
}

export const crmService = {
  getGrupos: () => loadState().grupos,
  getGrupo: (id: string) => loadState().grupos.find((g) => g.id === id),
  createGrupo: (grupo: Omit<Grupo, "id" | "alumnos">) => {
    const state = loadState();
    const newGrupo: Grupo = { ...grupo, id: crypto.randomUUID(), alumnos: [] };
    state.grupos.push(newGrupo);
    saveState(state);
    return newGrupo;
  },
  addAlumno: (grupoId: string, alumno: Omit<Alumno, "id">) => {
    const state = loadState();
    const g = state.grupos.find((x) => x.id === grupoId);
    if (!g) throw new Error("Grupo not found");
    const newAlumno: Alumno = { ...alumno, id: crypto.randomUUID() };
    g.alumnos.push(newAlumno);
    state.progresos.push({ alumnoId: newAlumno.id, leccionesCompletadas: [] });
    saveState(state);
    return newAlumno;
  },
  removeAlumno: (grupoId: string, alumnoId: string) => {
    const state = loadState();
    const g = state.grupos.find((x) => x.id === grupoId);
    if (!g) return;
    g.alumnos = g.alumnos.filter((a) => a.id !== alumnoId);
    state.progresos = state.progresos.filter((p) => p.alumnoId !== alumnoId);
    saveState(state);
  },
  getProgreso: (alumnoId: string) => {
    return loadState().progresos.find((p) => p.alumnoId === alumnoId);
  },
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
