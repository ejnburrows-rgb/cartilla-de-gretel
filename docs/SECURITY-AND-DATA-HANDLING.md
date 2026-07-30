# Seguridad y manejo de datos — estado preparado

Actualizado: 2026-07-30

## Estado actual

- **Bloqueador:** el diseño anterior permitía que el flujo anónimo de código de clase terminara entregando `student_code`, que funciona como credencial reutilizable de un menor.
- **Bloqueador:** los códigos reales `GRETEL` y `NOVO26` siguen documentados como códigos fáciles de adivinar. Esta rama no los rota ni toca datos reales.
- **Alto:** el registro público ya no debe conceder rol docente automáticamente cuando se aplique la migración preparada.
- **Alto:** los metadatos de progreso deben limitarse a campos explícitos: `exercise`, `page`, `attempt`, `inputMode`, `durationMs`.

## Reparación preparada en esta rama

La migración preparada `20260730100000_secure_student_sessions_and_teacher_approval.sql` crea:

1. sesiones estudiantiles cortas, limitadas a un estudiante y una clase;
2. validación server-side de sesión;
3. historial de rotación de códigos de clase;
4. invitaciones docentes y estado pendiente por defecto;
5. solicitudes trazables de archivo, exportación, solicitud de borrado y borrado permanente;
6. límite de 1000 caracteres para notas docentes;
7. validación de metadatos de progreso.

## Retención propuesta

Propuesta pendiente de decisión del dueño antes de producción:

- Alumno activo: conservar progreso mientras la clase esté activa.
- Alumno archivado: conservar por 365 días para reportes de cierre.
- Solicitud de eliminación: marcar en `deletion_requested_at`, exportar si procede, y borrar permanentemente tras aprobación.
- Borrado permanente: eliminar o anonimizar datos del menor y conservar solo registro mínimo no identificable de auditoría.

## Información infantil almacenada y motivo

- Nombre visible del alumno: para que el docente identifique al menor dentro de su clase.
- Clase: para separar acceso por maestro y grupo.
- Progreso por lección: para continuar actividades y generar informes educativos.
- Página actual: para reanudar donde el menor se quedó.
- Notas docentes limitadas: para observaciones pedagógicas breves, sin datos médicos, diagnósticos, circunstancias familiares ni detalles sensibles innecesarios.

## Gates antes de producción

- Aprobación explícita del dueño para aplicar migraciones de autenticación/permisos.
- Plan de aviso docente antes de rotar códigos reales.
- Prueba en Supabase dev con datos sintéticos.
- Respaldo/exportación antes de cualquier operación sobre datos reales.
