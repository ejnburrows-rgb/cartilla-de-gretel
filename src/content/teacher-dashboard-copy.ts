// teacher-dashboard-copy.ts — labels + microcopy for the teacher CRM.
// Bilingual. Used by every maestro/* and analitica/* route.

export type DashboardKey =
	| "nav.home"
	| "nav.classes"
	| "nav.students"
	| "nav.assignments"
	| "nav.reports"
	| "nav.parents"
	| "nav.analytics"
	| "nav.session"
	| "action.add-class"
	| "action.add-student"
	| "action.assign-lesson"
	| "action.send-message"
	| "action.print"
	| "action.export-pdf"
	| "action.start-session"
	| "action.end-session"
	| "action.invite-family"
	| "label.class"
	| "label.student"
	| "label.lesson"
	| "label.page"
	| "label.mastery"
	| "label.streak"
	| "label.last-active"
	| "label.intervention"
	| "label.standard"
	| "label.notes"
	| "label.attempts"
	| "label.accuracy"
	| "label.time-on-page"
	| "label.badges-earned"
	| "empty.no-data"
	| "section.kpi"
	| "section.roster"
	| "section.heatmap"
	| "section.trends"
	| "section.alerts"
	| "section.coverage";

export const DASH_COPY: Record<DashboardKey, { es: string; en: string }> = {
	"nav.home":           { es: "Inicio",                          en: "Home" },
	"nav.classes":        { es: "Clases",                          en: "Classes" },
	"nav.students":       { es: "Alumnos",                         en: "Students" },
	"nav.assignments":    { es: "Asignaciones",                    en: "Assignments" },
	"nav.reports":        { es: "Reportes",                        en: "Reports" },
	"nav.parents":        { es: "Familias",                        en: "Families" },
	"nav.analytics":      { es: "Anal\u00edtica",                  en: "Analytics" },
	"nav.session":        { es: "Sesi\u00f3n en vivo",             en: "Live session" },
	"action.add-class":   { es: "Nueva clase",                     en: "New class" },
	"action.add-student": { es: "Agregar alumno",                  en: "Add student" },
	"action.assign-lesson": { es: "Asignar lecci\u00f3n",          en: "Assign lesson" },
	"action.send-message":{ es: "Enviar mensaje",                  en: "Send message" },
	"action.print":       { es: "Imprimir",                         en: "Print" },
	"action.export-pdf":  { es: "Exportar PDF",                    en: "Export PDF" },
	"action.start-session": { es: "Iniciar sesi\u00f3n",            en: "Start session" },
	"action.end-session": { es: "Finalizar sesi\u00f3n",            en: "End session" },
	"action.invite-family":{ es: "Invitar familia",                en: "Invite family" },
	"label.class":        { es: "Clase",                            en: "Class" },
	"label.student":      { es: "Alumno",                          en: "Student" },
	"label.lesson":       { es: "Lecci\u00f3n",                    en: "Lesson" },
	"label.page":         { es: "P\u00e1gina",                     en: "Page" },
	"label.mastery":      { es: "Dominio",                          en: "Mastery" },
	"label.streak":       { es: "Racha",                            en: "Streak" },
	"label.last-active":  { es: "\u00daltima actividad",           en: "Last active" },
	"label.intervention": { es: "Intervenci\u00f3n",               en: "Intervention" },
	"label.standard":     { es: "Est\u00e1ndar",                   en: "Standard" },
	"label.notes":        { es: "Notas",                            en: "Notes" },
	"label.attempts":     { es: "Intentos",                         en: "Attempts" },
	"label.accuracy":     { es: "Precisi\u00f3n",                  en: "Accuracy" },
	"label.time-on-page": { es: "Tiempo en la p\u00e1gina",        en: "Time on page" },
	"label.badges-earned":{ es: "Insignias obtenidas",              en: "Badges earned" },
	"empty.no-data":      { es: "A\u00fan no hay datos.",          en: "No data yet." },
	"section.kpi":        { es: "Indicadores",                      en: "Key indicators" },
	"section.roster":     { es: "Lista de alumnos",                en: "Roster" },
	"section.heatmap":    { es: "Mapa de dominio",                  en: "Mastery heatmap" },
	"section.trends":     { es: "Tendencias",                       en: "Trends" },
	"section.alerts":     { es: "Alertas",                          en: "Alerts" },
	"section.coverage":   { es: "Cobertura de est\u00e1ndares",    en: "Standards coverage" },
};

export function dash(key: DashboardKey, lang: "es" | "en" = "es"): string {
	return DASH_COPY[key]?.[lang] ?? key;
}
