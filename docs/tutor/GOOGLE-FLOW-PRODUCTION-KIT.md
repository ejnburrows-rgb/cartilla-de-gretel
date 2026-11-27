# Kit de Producción Silencioso — Google Flow ($0 / Créditos Diarios Gratuitos)

Este flujo aprovecha los **50 créditos diarios gratuitos de Google Flow** ([support.google.com/flow/answer/16526234](https://support.google.com/flow/answer/16526234)) usando el modo **Frames to Video (Inicio + Fin con el mismo fotograma maestro)** para generar giros y escritura de cuerpo completo 100 % naturales sin ninguna articulación recortada artificial.

> **Regla estricta de audio y apariencia:** Todo clip generado es silencioso (`No speaking, mouth gently closed, calm breathing`). La voz y la sincronía labial de Gretel siguen viniendo exclusivamente de las grabaciones aprobadas y sus archivos `.visemes.json` en la postura frontal.

---

## Fotograma Maestro Único (`flow-refs/ref-stage-master.png`, 1600×1000)

Archivo exacto listo para subir a Google Flow:
`public/cartilla/images/gretel/tutor/hybrid-candidates/flow-refs/ref-stage-master.png`

Contiene en una sola imagen coherente:
- La pizarra verde profunda con marco de roble vintage y tiza *"Cartilla de Gretel"*.
- Los trazos de tiza y el borrador descansando en la repisa inferior.
- El retrato frontal exacto de Gretel **apoyado detrás de la repisa** para evitar cortes flotantes.

---

## Prompts exactos para **Frames to Video** (`Inicio: ref-stage-master.png` → `Fin: ref-stage-master.png`)

Usar exactamente la misma imagen al principio y al final permite que Gretel vuelva siempre a su pose exacta al terminar el movimiento, logrando transiciones invisibles con la malla 2D en vivo.

### Clip 1 — Escucha natural (`natural-listening.mp4`)
- **Imagen Inicio / Fin:** `flow-refs/ref-stage-master.png` → `flow-refs/ref-stage-master.png`
- **Prompt exacto:**
  `Keep the exact hand-painted storybook girl Gretel and exact green chalkboard room untouched. Gentle warm listening loop: calm relaxed breathing at shoulders, one slow soft eye blink, tiny reassuring head tilt and slight warm eyes-only smile, golden wavy curls resting softly. Mouth remains softly closed, zero talking, fixed camera, warm steady lighting.`

### Clip 2 — Giro natural, escritura en tiza y regreso (`turn-and-write.mp4`)
- **Imagen Inicio / Fin:** `flow-refs/ref-stage-master.png` → `flow-refs/ref-stage-master.png`
- **Prompt exacto:**
  `Keep the exact painted character Gretel, red hair bow, orange striped shirt, floral blue overalls, and exact green chalkboard untouched. Seamless teacher action starting from her front pose: Gretel smoothly turns toward the green chalkboard on the left, gracefully lifts a single small stick of white chalk with one natural hand, writes a word across the slate in smooth gentle strokes, pauses warmly, lowers her arm behind the oak chalk ledge, and smoothly turns back into the exact ending front portrait. Natural shoulder anatomy, calm friendly pace, silent, fixed camera.`

### Clip 3 — Giro natural, borrado con borrador escolar y regreso (`turn-and-erase.mp4`)
- **Imagen Inicio / Fin:** `flow-refs/ref-stage-master.png` → `flow-refs/ref-stage-master.png`
- **Prompt exacto:**
  `Keep the exact painted character Gretel and vintage oak chalkboard identical. Seamless silent teaching clip: starting from the front pose, Gretel turns calmly toward the green chalkboard, picks up the wood-and-felt school eraser cleanly, wipes an upper chalk note horizontally with a tiny puff of fine white chalk dust, returns the eraser toward the tray, and smoothly turns back to face the student with a warm friendly expression matching the ending frame. Fixed static camera, natural smooth clothing folds, no dialogue.`

---

## Cómo probar y activar ($0)

1. Genera los clips en Google Flow usando `ref-stage-master.png`.
2. Para probarlos al instante en el navegador sin tocar código, haz clic en **"Probar clip Google Flow (.mp4)"** dentro de `http://127.0.0.1:5175/tutor-hybrid-preview.html`.
3. Para dejarlos fijos de forma local y offline, guárdalos en:
   - `public/cartilla/images/gretel/tutor/flow-clips/natural-listening.mp4`
   - `public/cartilla/images/gretel/tutor/flow-clips/turn-and-write.mp4`
   - `public/cartilla/images/gretel/tutor/flow-clips/turn-and-erase.mp4`

El componente `TutorHybridStage` los detecta y reproduce automáticamente con fundido suave al entrar en cada fase.
