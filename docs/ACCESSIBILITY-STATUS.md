# Accesibilidad — matriz de aceptación

Actualizado: 2026-07-30

No se reclama certificación formal (WCAG AA/AAA no auditado por un tercero).
Esta matriz registra lo que sí se comprobó, cómo, y lo que sigue pendiente de
una prueba humana con tecnología de asistencia real.

## Qué es automático y qué es manual

`tests/e2e/accessibility.spec.ts` corre en cada ruta de producción (390px,
login de docente vía la vía demo/seed) y comprueba, de forma determinista:
sin desbordamiento horizontal, cada `<img>` tiene `alt`, cada control de
formulario tiene nombre accesible (label asociado o `aria-label`), existe un
landmark `main`, y los primeros elementos enfocables muestran un indicador de
foco visible (outline, box-shadow o anillo). También hay pruebas de zoom al
200% (sin desbordamiento) y de carga bajo `prefers-reduced-motion`. Esto **no
sustituye** una herramienta de conformidad WCAG completa — no evalúa
contraste de color ni semántica ARIA — es lo que se puede automatizar de
forma confiable hoy sin agregar una dependencia nueva sin autorización.

Todo lo demás en la tabla es manual o inferido del código (marcado como tal),
no verificado con un lector de pantalla real.

## Matriz por ruta

Automatizado (columnas 1-5) = cubierto por `accessibility.spec.ts`, corre en
CI en cada PR. Estado refleja la ejecución más reciente (2026-07-30, 28/28
pruebas pasaron).

| Ruta | Sin overflow 390px | Alt en imágenes | Controles con nombre | Landmark main | Foco visible | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/lecciones` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/leccion/$n` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/mi-progreso` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/practica` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/repaso` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/unirse` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/ayuda` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/animales` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/autora` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/voces` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/imprimir/$n`, `/all` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/presentar/$n` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/login` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/intro` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/credits` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/teacher` (Inicio) | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/teacher/crm` (Clases) | PASS | PASS | PASS* | PASS | PASS | Automatizado |
| `/cartilla/teacher/roster` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/teacher/guia` (Contenido) | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/teacher/reportes` (Informes) | PASS | PASS | PASS* | PASS | PASS | Automatizado |
| `/cartilla/teacher/ayuda` | PASS | PASS | PASS | PASS | PASS | Automatizado |
| `/cartilla/teacher/flipchart` | PASS | PASS | PASS* | PASS | PASS | Automatizado |
| `/cartilla/teacher/admin` | PASS | PASS | PASS | PASS | PASS | Automatizado |

\* Estas tres rutas tenían controles sin nombre accesible (buscador de
`Topbar`, selector "Tu Clase" en `TeacherCrmShell`, selector de lección en
`TaskList`, textarea de comentarios en `AccountPanel`, dos selectores en
`StudentPicker`, buscador en `LessonCatalog`) — corregido en esta misma
pasada con `aria-label` o asociación `label`/`htmlFor`, sin cambiar el
diseño visual.

Dos brechas de encabezado (`h1`) encontradas y corregidas sin cambiar texto
visible: `/intro` y `/cartilla/` (splash) no tenían ningún `<h1>` — en
`IntroSplash.tsx` el saludo visible pasó de `<p>` a `<h1>` (mismo texto,
misma clase). La página de lección (`/cartilla/leccion/$n`) sigue sin un
`<h1>` semántico propio — no se tocó porque el título de la lección vive
dentro del renderer de página fiel al libro, y modificar esa jerarquía se
consideró fuera del alcance de "limpiar sin rediseñar". **Pendiente.**

## Lo que no se puede comprobar sin un humano y tecnología de asistencia real

- **Completar una tarea completa solo con teclado** (unirse a clase → hacer
  una lección → ver progreso; crear clase → agregar alumnos → asignar
  lección). El foco visible y el nombre accesible de cada control están
  comprobados; el *flujo* completo, no.
- **Comportamiento real con lector de pantalla** (NVDA, VoiceOver, TalkBack).
  No ejecutado — el entorno de esta sesión no tiene un lector de pantalla
  real disponible.
- **Mensajes de error como texto real, no solo color.** `src/components/a11y/
  LiveRegion.tsx` existe (una región `aria-live` reutilizable) pero no está
  importada en ningún otro archivo — no está conectada a ningún flujo real
  todavía. Los mensajes de error visibles (ej. `login.tsx`, `unirse.tsx`) se
  muestran como texto normal en el DOM, así que un lector de pantalla los
  anuncia si el usuario navega hasta ellos, pero no hay confirmación de que
  se anuncien automáticamente al aparecer.
- **Alto contraste, fuente para dislexia, texto grande.** Existen de verdad
  en código: `StudentBookToolbar.tsx` tiene botones que cambian el tema a
  `"high-contrast"` y `"dyslexia"`, y `storage-keys.ts` tiene una clave
  `a11yLargeText` dedicada — pero viven solo en la barra de herramientas del
  lector de la página del libro, no verificado que cubran todas las
  pantallas (CRM, reportes, formularios de docente). No verificado
  visualmente con un usuario real que los necesite.
- **Movimiento reducido.** Comprobado que las páginas cargan y renderizan
  bajo `prefers-reduced-motion: reduce` (no se rompen). No comprobado que
  *todas* las animaciones específicamente se atenúen — solo que la carga no
  falla.
- **Alternativa a arrastrar/trazar de precisión fina.** `DragPlace.tsx`
  (`src/cartilla/interactions/DragPlace.tsx`) ya implementa
  tocar-para-seleccionar-luego-tocar-para-colocar como alternativa al
  arrastre real (líneas con `onClick`/`onTap` junto a los manejadores de
  arrastre) — confirmado en el código, no probado con un usuario que
  dependa de esa alternativa.

## Reglas de aceptación

- Toda acción importante debe completarse solo con teclado.
- El foco debe ser visible y moverse en orden lógico.
- Los errores deben leerse como texto real, no solo color.
- Las actividades de arrastrar o trazar necesitan alternativa no dependiente de precisión fina.
- El modo de fuente para dislexia, texto grande, contraste alto y movimiento reducido deben preservar la apariencia aprobada lo más posible.

## Siguiente paso recomendado, no hecho aquí

Agregar `@axe-core/playwright` (o equivalente) para contraste de color y
validación de semántica ARIA requiere una dependencia nueva — no agregada en
esta sesión porque `AGENTS.md` exige autorización explícita del propietario
antes de instalar cualquier dependencia nueva, sin excepciones, y esa
autorización no llegó durante esta sesión.
