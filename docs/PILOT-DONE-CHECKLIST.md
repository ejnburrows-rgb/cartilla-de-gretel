# Lista de "terminado" para el piloto

Actualizado: 2026-07-30

Cada punto se marca solo con evidencia real (salida de prueba, captura o registro), nunca por suposición.

## Funciona en los equipos del aula

- [ ] Funciona en tableta táctil.
- [ ] Funciona con ratón.
- [ ] Sin desbordamiento horizontal a 390px.
- [ ] Navegación verificada en 390px, tableta y escritorio.

## No pierde trabajo ni muestra pantallas rotas

- [ ] Errores de red muestran mensaje claro y opción de reintento.
- [ ] El progreso pendiente se reintenta y no se pierde al reconectar.
- [ ] Ninguna pantalla queda en blanco ante un fallo.

## Datos de menores protegidos para uso real

- [ ] El código de clase por sí solo no entrega credencial reutilizable.
- [ ] El código de clase por sí solo no permite leer progreso.
- [ ] El código de clase por sí solo no permite escribir progreso.
- [ ] Una sesión no puede actuar como otro menor.
- [ ] Metadatos de progreso limitados a campos explícitos.
- [ ] Notas docentes con límite y advertencia visible.
- [ ] Existe camino probado de archivo, exportación y eliminación.

## Sin secretos expuestos

- [ ] Sin contraseñas, claves ni tokens en el código.
- [ ] Escaneo de secretos en verde en CI.

## Acceso docente controlado

- [ ] El registro público no concede acceso docente automático.
- [ ] Estados visibles: pendiente, invitación inválida, invitación vencida, sin autorización, cargando, reintento.
- [ ] Cuentas docentes y de administración existentes siguen funcionando.

## El producto coincide con lo prometido

- [ ] Orden de lecciones y letras sin cambios.
- [ ] Contenido en español original sin cambios.
- [ ] Ilustraciones auténticas sin sustituciones.
- [ ] Arte faltante sigue marcado "ilustración pendiente".
- [ ] Separación entre cuaderno del alumno y rotafolio docente intacta.

## Entrega y mantenimiento

- [ ] Documento de contrato listo para revisión.
- [ ] Documento de seguimiento y revisión listo.
- [ ] Documento de entrega final listo.
- [ ] Instrucciones de despliegue, rollback, exportación, respaldo y mantenimiento listas.
