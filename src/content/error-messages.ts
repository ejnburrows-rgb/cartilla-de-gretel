// error-messages.ts — bilingual UI error + empty-state copy.
// All strings used in error / empty / loading states route through here so
// translation stays consistent and a future locale switch is one-shot.

export type MessageKey =
  | "offline.banner"
  | "offline.empty"
  | "loading"
  | "saving"
  | "saved"
  | "save-failed"
  | "page-missing"
  | "page-load-failed"
  | "pdf-load-failed"
  | "no-results"
  | "no-students-yet"
  | "no-assignments-yet"
  | "no-classes-yet"
  | "no-messages-yet"
  | "no-badges-yet"
  | "no-progress-yet"
  | "requires-login"
  | "invalid-input"
  | "network-error"
  | "try-again"
  | "retry"
  | "dismiss"
  | "cancel"
  | "confirm"
  | "close";

export const MESSAGES: Record<MessageKey, { es: string; en: string }> = {
  "offline.banner": {
    es: "Sin conexi\u00f3n. La aplicaci\u00f3n sigue funcionando.",
    en: "Offline. The app keeps working.",
  },
  "offline.empty": {
    es: "Esto necesita conexi\u00f3n. Vuelve cuando est\u00e9s en l\u00ednea.",
    en: "This needs an internet connection. Come back when you're online.",
  },
  loading: { es: "Cargando...", en: "Loading..." },
  saving: { es: "Guardando...", en: "Saving..." },
  saved: { es: "Guardado.", en: "Saved." },
  "save-failed": {
    es: "No se pudo guardar. Intenta de nuevo.",
    en: "Could not save. Please try again.",
  },
  "page-missing": { es: "Esta p\u00e1gina no existe.", en: "This page does not exist." },
  "page-load-failed": {
    es: "No se pudo cargar la p\u00e1gina. Vamos a intentar de nuevo.",
    en: "Could not load the page. Let's try again.",
  },
  "pdf-load-failed": {
    es: "No se pudo cargar el libro. Verifica tu conexi\u00f3n.",
    en: "Could not load the book. Check your connection.",
  },
  "no-results": { es: "Sin resultados.", en: "No results." },
  "no-students-yet": {
    es: "A\u00fan no hay alumnos. Agrega tu primer alumno para comenzar.",
    en: "No students yet. Add your first student to get started.",
  },
  "no-assignments-yet": { es: "A\u00fan no hay tareas asignadas.", en: "No assignments yet." },
  "no-classes-yet": {
    es: "A\u00fan no hay clases. Crea tu primera clase.",
    en: "No classes yet. Create your first class.",
  },
  "no-messages-yet": { es: "A\u00fan no hay mensajes.", en: "No messages yet." },
  "no-badges-yet": {
    es: "A\u00fan no has ganado insignias. \u00a1Vamos a empezar!",
    en: "No badges yet. Let's get started!",
  },
  "no-progress-yet": {
    es: "A\u00fan no hay progreso registrado.",
    en: "No progress recorded yet.",
  },
  "requires-login": { es: "Inicia sesi\u00f3n para continuar.", en: "Sign in to continue." },
  "invalid-input": {
    es: "Revisa los datos e intenta de nuevo.",
    en: "Please check your input and try again.",
  },
  "network-error": {
    es: "Problema de conexi\u00f3n. Intenta otra vez.",
    en: "Connection problem. Please try again.",
  },
  "try-again": { es: "Intentar otra vez", en: "Try again" },
  retry: { es: "Reintentar", en: "Retry" },
  dismiss: { es: "Descartar", en: "Dismiss" },
  cancel: { es: "Cancelar", en: "Cancel" },
  confirm: { es: "Confirmar", en: "Confirm" },
  close: { es: "Cerrar", en: "Close" },
};

export function msg(key: MessageKey, lang: "es" | "en" = "es"): string {
  return MESSAGES[key]?.[lang] ?? key;
}
