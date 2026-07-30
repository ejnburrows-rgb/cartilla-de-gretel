# Seguimiento y revisión del proyecto

Actualizado: 2026-07-30

Documento vivo que se usa durante el proyecto, no al final. Se actualiza en cada revisión.

## Estado por área

| Área | Estado | Evidencia | Siguiente paso |
| --- | --- | --- | --- |
| Acceso de alumnos | Reparación preparada, no aplicada en vivo | Migraciones preparadas y pruebas negativas | Aprobar migración en dev |
| Rotación de códigos de clase | Preparada, no ejecutada | Función de rotación e historial | Decidir ventana y aviso docente |
| Acceso docente | Puerta de aprobación preparada | Estados de acceso y pruebas | Elegir invitación o aprobación manual |
| Datos de menores | Límites y caminos preparados | Validación de metadatos y notas | Aprobar retención propuesta |
| Pruebas y CI | Puerta única de PR creada | Flujo de verificación | Requerir la verificación en la rama principal |
| Rendimiento | Precarga de PDF eliminada, reglas de bundle corregidas | Presupuesto de bundle en CI | Medir totales reales en CI |
| Accesibilidad | Matriz de aceptación creada | Documento de accesibilidad | Completar verificación ruta por ruta |
| Contenido y arte | Sin cambios | Reglas del libro respetadas | Decisiones de contenido del dueño |

## Riesgos abiertos

1. Migración de autenticación pendiente de aprobación.
2. Códigos de clase reales todavía sin rotar.
3. Retención de datos propuesta, no aprobada.
4. Evidencia de accesibilidad y capturas responsivas pendientes de ejecución en CI.

## Decisiones que requieren al cliente

- Aviso a familias y docentes antes de rotar códigos.
- Plazo de conservación de datos de alumnos que dejan la clase.
- Quién mantiene el sistema después de la entrega.

## Registro de revisiones

| Fecha | Revisión | Acuerdos |
| --- | --- | --- |
| 2026-07-30 | Revisión de seguridad y calidad | Reparaciones seguras aplicadas en rama; cambios sobre datos reales quedan bloqueados hasta aprobación |
