// cartilla-routes.ts — typed route URL builders.
// All routes referenced from JSX / lib code should pass through these helpers.
// Single source of truth. If a route path changes, update once here.

export const routes = {
	root: () => "/",
	lesson: (n: number) => `/cartilla/leccion/${n}`,
	lessonList: () => "/cartilla/lecciones",

	// Student
	studentHome: () => "/cartilla/alumno",
	studentLogin: () => "/cartilla/alumno/login",
	studentProfile: () => "/cartilla/alumno/perfil",
	studentHomework: () => "/cartilla/alumno/tareas",
	studentMastery: () => "/cartilla/alumno/dominio",
	studentAchievements: () => "/cartilla/alumno/logros",

	// Family
	familyHome: () => "/cartilla/familia",
	familyPractice: () => "/cartilla/familia/practica",
	familyMessages: () => "/cartilla/familia/mensajes",
	familyReport: (id: string) => `/cartilla/familia/reporte/${id}`,

	// Teacher CRM
	teacherHome: () => "/cartilla/maestro",
	teacherClasses: () => "/cartilla/maestro/clases",
	teacherClass: (id: string) => `/cartilla/maestro/clase/${id}`,
	teacherStudents: () => "/cartilla/maestro/alumnos",
	teacherStudent: (id: string) => `/cartilla/maestro/alumno/${id}`,
	teacherSession: (n: number) => `/cartilla/maestro/sesion/${n}`,
	teacherAssignments: () => "/cartilla/maestro/asignaciones",
	teacherReports: () => "/cartilla/maestro/reportes",
	teacherParents: () => "/cartilla/maestro/padres",

	// Analytics
	analyticsHome: () => "/cartilla/maestro/analitica",
	analyticsClass: (id: string) => `/cartilla/maestro/analitica/clase/${id}`,
	analyticsStudent: (id: string) => `/cartilla/maestro/analitica/alumno/${id}`,
	analyticsLesson: (n: number) => `/cartilla/maestro/analitica/leccion/${n}`,
	reportsExport: () => "/cartilla/maestro/reportes/exportar",
	reportsIep: (id: string) => `/cartilla/maestro/reportes/iep/${id}`,

	// Director / Principal
	director: () => "/cartilla/director",
	directorSchool: (id: string) => `/cartilla/director/escuela/${id}`,

	// Print / kiosko
	binder: () => "/cartilla/binder",
	binderLesson: (n: number) => `/cartilla/binder/${n}`,
	kiosko: () => "/cartilla/kiosko",
	kioskoPage: (n: number) => `/cartilla/kiosko/${n}`,

	// Shareable
	reportShare: (id: string) => `/r/${id}`,
} as const;

export type RouteKey = keyof typeof routes;
