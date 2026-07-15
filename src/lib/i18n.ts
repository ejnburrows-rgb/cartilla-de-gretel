export type Language = "es" | "en";

export const translations = {
  es: {
    // Nav
    home: "Inicio",
    students: "Estudiantes",
    progress: "Progreso",
    settings: "Configuración",
    logout: "Cerrar sesión",
    // CRM
    teacherPortal: "Portal para Maestros",
    classRoster: "Lista de Clase",
    addStudent: "Añadir Estudiante",
    studentName: "Nombre del estudiante",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    // Empty states
    noStudents: "No hay estudiantes todavía.",
    noData: "Sin datos disponibles.",
    // Folders / Guia
    objetivos: "Objetivos",
    procedimiento: "Procedimiento",
    vocabulario: "Vocabulario",
    evaluacion: "Evaluación",
    // Help Section
    helpTitle: "Cómo se usa",
    helpCreateClass: "Crear una clase: Ve a la pestaña de Estudiantes y añade nombres.",
    helpShareCode: "Compartir código: Cada estudiante recibirá un código de acceso único.",
    helpProgress: "Reporte de progreso: Revisa las estadísticas en la pestaña de Progreso.",
    helpLanguage: "Cambiar idioma: Usa el botón ES/EN en la parte superior.",
    helpTheme: "Modo oscuro: Usa el botón de luna/sol en la parte superior para cambiar el tema.",
  },
  en: {
    // Nav
    home: "Home",
    students: "Students",
    progress: "Progress",
    settings: "Settings",
    logout: "Log out",
    // CRM
    teacherPortal: "Teacher Portal",
    classRoster: "Class Roster",
    addStudent: "Add Student",
    studentName: "Student Name",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    // Empty states
    noStudents: "No students yet.",
    noData: "No data available.",
    // Folders / Guia
    objetivos: "Objectives",
    procedimiento: "Procedure",
    vocabulario: "Vocabulary",
    evaluacion: "Assessment",
    // Help Section
    helpTitle: "How to use",
    helpCreateClass: "Create a class: Go to the Students tab and add names.",
    helpShareCode: "Share code: Each student gets a unique access code.",
    helpProgress: "Progress report: Check stats in the Progress tab.",
    helpLanguage: "Switch language: Use the ES/EN button at the top.",
    helpTheme: "Dark mode: Use the moon/sun button at the top to toggle theme.",
  },
};

export function t(key: keyof typeof translations.es, lang: Language) {
  return translations[lang][key] || translations["es"][key];
}
