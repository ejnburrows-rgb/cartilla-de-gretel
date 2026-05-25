export const mockStudents = [
  { id: '1', name: 'Sofía Martínez', status: 'excelente', progress: 85, lastActive: 'Hace 2 horas', alert: false },
  { id: '2', name: 'Mateo López', status: 'atencion', progress: 30, lastActive: 'Ayer', alert: true },
  { id: '3', name: 'Valentina Ruiz', status: 'progreso', progress: 55, lastActive: 'Hace 5 horas', alert: false },
  { id: '4', name: 'Diego Torres', status: 'progreso', progress: 60, lastActive: 'Hace 1 día', alert: false },
  { id: '5', name: 'Camila Gómez', status: 'excelente', progress: 92, lastActive: 'Hace 1 hora', alert: false },
];

export const mockTasks = [
  { id: '1', title: 'Revisar lecturas de Mateo', due: 'Hoy', priority: 'high' },
  { id: '2', title: 'Preparar lección de la letra M', due: 'Mañana', priority: 'medium' },
  { id: '3', title: 'Enviar reporte semanal a padres', due: 'Viernes', priority: 'low' },
];

export const kpis = {
  activeStudents: 24,
  averageProgress: '64%',
  needsAttention: 3,
  lessonsCompletedThisWeek: 128
};
