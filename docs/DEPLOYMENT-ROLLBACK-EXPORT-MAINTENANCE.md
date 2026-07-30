# Despliegue, rollback, exportación, respaldo y mantenimiento

Actualizado: 2026-07-30

## Despliegue seguro

1. Fusionar solo un PR verde contra `main`.
2. Confirmar que CI ejecutó instalación determinística, validadores, typecheck, lint, unit tests, build, Playwright, presupuesto de bundle y secret scan.
3. No aplicar migraciones de autenticación, permisos, rotación ni datos reales sin aprobación explícita del dueño.
4. Para migraciones: aplicar primero en Supabase dev con datos sintéticos, verificar rollback, y recién después preparar ventana de producción.

## Orden de migración propuesto

1. Respaldar/exportar producción.
2. Aplicar `20260730100000_secure_student_sessions_and_teacher_approval.sql` en dev.
3. Ejecutar pruebas negativas de sesión estudiantil, registro docente, rotación y retención.
4. Preparar aviso docente para códigos nuevos.
5. Aplicar en producción solo con aprobación.
6. Rotar códigos reales con operación administrativa, no por script automático.

## Rollback

1. Detener nuevas rotaciones o invitaciones.
2. Ejecutar `20260730100001_rollback_secure_student_sessions_and_teacher_approval.sql` solo si el dueño acepta que se restaura el comportamiento anterior.
3. Verificar acceso docente y acceso estudiantil con datos sintéticos.
4. Documentar cualquier sesión o invitación invalidada.

## Exportación y respaldo

- Exportar clases, estudiantes, progreso por lección, eventos de progreso y solicitudes de datos antes de cambios productivos.
- Usar datos sintéticos en pruebas.
- Nunca incluir secretos ni datos reales en capturas, logs, issues o PRs.

## Mantenimiento

- Revisar mensualmente códigos de clase, cuentas docentes pendientes, solicitudes de datos y tamaño del bundle inicial.
- Mantener `docs/STATUS.md`, `docs/SECURITY-AND-DATA-HANDLING.md` y esta guía actualizadas en cada PR de seguridad.
