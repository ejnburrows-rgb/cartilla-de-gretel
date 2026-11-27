# Kit de Producción Silencioso — Google Flow ($0 / Créditos Diarios Gratuitos)

Este documento reúne los **10 clips silenciosos reutilizables** diseñados para el flujo gratuito de **Google Flow** (50 créditos diarios sin costo adicional, referencia oficial: [support.google.com/flow/answer/16526234](https://support.google.com/flow/answer/16526234)), preparados para mantener exactamente la identidad aprobada de Gretel, su vestido overol azul con flores bordadas, la blusa naranja a rayas, el lazo rojo y la pizarra escolar verde profundo con *"Cartilla de Gretel"*.

> **Regla estricta de audio:** Todos los clips generados en Google Flow son **acciones silenciosas sin diálogo** (`No dialogue, no lip movement, muted calm classroom ambiance`). La voz real de Gretel siempre proviene exclusivamente de los audios aprobados y las marcas fonéticas exactas `.visemes.json` de Rhubarb.

---

## Imágenes de referencia consistentes (`flow-refs/`)

Las siguientes referencias fueron generadas en `/cartilla/images/gretel/tutor/hybrid-candidates/flow-refs/` con exactamente el mismo fondo de pizarra verde vintage, marco de roble e iluminación cálida de aula:

1. `flow-refs/ref-listening.png` — Gretel de frente, postura serena mirando al estudiante (`1280×800`)
2. `flow-refs/ref-turn-left.png` — Gretel girada 3/4 hacia la izquierda mirando el área de escritura (`1280×800`)
3. `flow-refs/ref-writing.png` — Gretel 3/4 izquierda con brazo articulado sosteniendo tiza blanca sobre la pizarra (`1280×800`)
4. `flow-refs/ref-erasing.png` — Gretel 3/4 izquierda sosteniendo el borrador de madera y fieltro frente a la pizarra (`1280×800`)

---

## Prompts exactos y referencias por movimiento (Google Flow)

### 1. Escucha natural (`01-natural-listening.mp4`)
- **Modo en Google Flow:** Ingredients to Video (Ref: `flow-refs/ref-listening.png`)
- **Prompt exacto:**
  `Keep the exact hand-painted storybook character Gretel and exact green vintage chalkboard background labeled "Cartilla de Gretel". Calm 3-second seamless loop: gentle natural breathing at shoulders and chest, smooth slow eye blink, subtle iris glance left and right while listening attentively, faint warm relaxed smile, soft breeze-like settle of golden hair curls. No bouncing, no speaking, closed soft mouth, fixed camera, warm flat classroom lighting.`
- **Integración en el director híbrido:** Ranura `listen_1` / `listen_feedback`

### 2. Pensando (`02-thinking.mp4`)
- **Modo en Google Flow:** Ingredients to Video (Ref: `flow-refs/ref-listening.png`)
- **Prompt exacto:**
  `Keep exact painted Gretel and chalkboard background untouched. Gentle 2.5-second silent thinking gesture: subtle upward diagonal eye glance toward upper left, slight warm curiosity raise of left eyebrow, tiny natural head tilt (3 degrees), calm breathing, soft closed smiling mouth. Zero exaggerated cartoon motion, fixed static camera.`
- **Integración en el director híbrido:** Estado pedagógico `help` (pista)

### 3. Asentimiento amable (`03-gentle-acknowledgment.mp4`)
- **Modo en Google Flow:** Ingredients to Video (Ref: `flow-refs/ref-listening.png`)
- **Prompt exacto:**
  `Keep exact painted Gretel and chalkboard background untouched. Warm natural 2-second silent acknowledgment: two slow gentle reassuring head nods, soft crinkled smiling eyes, mild proud eyebrow lift, calm shoulder breathing, zero lip sync or speech, fixed camera, identical painted shading and linework.`
- **Integración en el director híbrido:** Ranura `acknowledge`

### 4. Girando hacia la pizarra (`04-turning-to-board.mp4`)
- **Modo en Google Flow:** Frames to Video (Inicio: `flow-refs/ref-listening.png` → Fin: `flow-refs/ref-turn-left.png`)
- **Prompt exacto:**
  `Smooth 1.5-second continuous anatomical body and head turn from facing front viewer toward three-quarter left facing the deep-green chalkboard. Golden wavy curls swing softly with realistic delayed follow-through motion. Keep red bow, striped orange shirt, floral denim overall, and chalkboard wording completely consistent without morphing. Fixed camera, mute silent motion.`
- **Integración en el director híbrido:** Ranura `turn_to_board`

### 5. Levantando la mano para escribir (`05-raising-hand-chalk.mp4`)
- **Modo en Google Flow:** Frames to Video (Inicio: `flow-refs/ref-turn-left.png` → Fin: `flow-refs/ref-writing.png`)
- **Prompt exacto:**
  `Smooth natural 1.5-second motion of Gretel already turned 3/4 toward the green chalkboard calmly raising her arm holding a white chalk stick cleanly into position near the center-left slate. Soft natural elbow flexion, realistic sleeve fold, calm attentive gaze fixed on chalkboard writing surface. Zero distortion on fingers or face, fixed camera.`
- **Integración en el director híbrido:** Transición `turn_to_board → write_demonstrate`

### 6. Escribiendo en la pizarra (`06-writing-chalkboard.mp4`)
- **Modo en Google Flow:** Ingredients to Video (Ref: `flow-refs/ref-writing.png`)
- **Prompt exacto:**
  `Gretel facing 3/4 left at the deep-green chalkboard moves her hand with the white chalk stick in controlled cursive horizontal writing strokes across the slate from left to right. Soft realistic shoulder and elbow motion accompanying hand stroke, subtle fine white chalk dust rising around chalk tip, golden hair swaying faintly with arm rhythm. Silent, fixed camera, zero text hallucination on face.`
- **Integración en el director híbrido:** Ranura `write_demonstrate` (la escritura real de palabras y sílabas sigue controlada por SVG/Canvas local en sincronía con el Audio)

### 7. Subrayando y encerrando en círculo (`07-underlining-circling.mp4`)
- **Modo en Google Flow:** Ingredients to Video (Ref: `flow-refs/ref-writing.png`)
- **Prompt exacto:**
  `Gretel turned 3/4 toward green chalkboard smoothly sweeps her chalk hand horizontally from left to right in one deliberate underline stroke, pauses briefly, then draws a smooth oval circling gesture in front of the left chalk zone. Natural eye tracking following hand position, serene teaching posture, fixed framing, silent clip.`
- **Integración en el director híbrido:** Subfase de subrayado y círculo silábico

### 8. Borrando la pizarra (`08-erasing-chalkboard.mp4`)
- **Modo en Google Flow:** Ingredients to Video (Ref: `flow-refs/ref-erasing.png`)
- **Prompt exacto:**
  `Gretel facing 3/4 left holds the traditional wooden felt chalkboard eraser and sweeps smoothly left-to-right and right-to-left over the upper chalkboard zone with light fine chalk powder puffing upward softly into the air. Natural upper-body lean following elbow arc, consistent denim overall embroidery and orange sleeve, mute silent clip, fixed camera.`
- **Integración en el director híbrido:** Ranura `erase_board`

### 9. Señalando contenido didáctico (`09-pointing-content.mp4`)
- **Modo en Google Flow:** Ingredients to Video (Ref: `flow-refs/ref-writing.png`)
- **Prompt exacto:**
  `Gretel gestures smoothly with open palm or chalk toward the teaching zone on the green chalkboard, holding a calm steady instructional pose with gentle eyebrow encouragement and brief eye glance from board toward student camera angle. Natural light breathing, fixed camera, silent clip.`
- **Integración en el director híbrido:** Estado pedagógico `pointing`

### 10. Volviendo hacia el estudiante (`10-turning-back.mp4`)
- **Modo en Google Flow:** Frames to Video (Inicio: `flow-refs/ref-turn-left.png` → Fin: `flow-refs/ref-listening.png`)
- **Prompt exacto:**
  `Smooth 1.5-second turn back from three-quarter chalkboard orientation toward front-facing eye contact with the student. Arm relaxes naturally down below frame, warm welcoming smile, relaxed attentive eyebrows, natural hair curl settle matching exact starting portrait identity. Fixed camera, muted silent video.`
- **Integración en el director híbrido:** Ranura `turn_back`

---

## Instalación local automática ($0)

Una vez generados los `.mp4` gratuitos en Google Flow, simplemente guárdalos dentro de:
`public/cartilla/images/gretel/tutor/flow-clips/` con los nombres indicados (`01-natural-listening.mp4`, etc.). El mapa `GOOGLE_FLOW_CLIP_SLOTS` en `src/lib/tutor-hybrid-director.ts` los detectará como sobrescritura opcional sin tocar el motor offline local.
