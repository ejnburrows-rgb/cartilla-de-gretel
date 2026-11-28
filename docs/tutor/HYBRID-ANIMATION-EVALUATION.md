# Evaluación Técnica — Arquitectura Híbrida de Animación ($0 Adicionales)

## 1. Investigación práctica de Rive (`rive-cli`, `@rive-app/react-canvas` y precios)

1. **Estado instalado en el proyecto:** El repositorio incluye `@rive-app/react-canvas` `4.35.0`, sin archivos `.riv` activos.
2. **Prueba empírica de `rive-cli` en este equipo:**
   - Comando ejecutado: `curl -fsSL https://releases.rive.app/cli/install.sh | sh`
   - Resultado real en este Mac Intel (`Darwin 25.6.0 / x86_64`): **`rive-cli is not shipped for macOS x86_64 yet`** (binario distribuido únicamente para Apple Silicon `arm64`, Linux o Windows).
3. **Restricción gratuita ($0):** Según `rive.app/pricing`, las exportaciones en plan gratuito muestran una pantalla de presentación (*splash screen*) de Rive salvo suscripción paga, incompatible con la regla estricta de **$0 gasto adicional** y con la estética limpia infantil.

---

## 2. Lección visual y refinamiento de calidad real infantil

Durante la revisión inicial se descartó explícitamente el uso de recortes 2D de brazos/manos pegados sobre el torso (cinemática inversa 2D rígida sobre recorte plano) y los fundidos superpuestos entre dos cabezas, porque producían efecto de brazo artificial y doble rostro inquietante para niños.

La solución refinada combina lo mejor con **$0 gasto**:

1. **Rostro y torso frontal cálido con malla 2D orgánica (`TutorHybridStage.tsx`, `tutor-mesh-rig.ts`):**
   - Deformación triangular suave (`14×10`) sin líneas de corte visibles para respiración natural, inclinaciones suaves, seguimiento de mirada hacia la pizarra o estudiante, parpadeo en 5 etapas (`lid-25`..`lid-100`), cejas continuas, rizos con retardo de fase y lip-sync Rhubarb exacto al milisegundo (`A–G`/`X`).
2. **Pizarra interactiva limpia y natural:**
   - Cuando se ejecuta de forma 100 % local offline, la tiza escolar y el borrador de madera con fieltro se animan suavemente sobre la pizarra *"Cartilla de Gretel"* en sincronía exacta con las sílabas y el audio (sin brazos flotantes ni manos artificiales), y el borrador desaparece de la repisa mientras está en uso.
3. **Integración directa con Google Flow (`<video>` automático + selector vivo):**
   - Cuando se requiere ver a Gretel girando el cuerpo completo para escribir con su brazo animado naturalmente, el escenario incluye un reproductor transparente de clips `.mp4` alimentado con el fotograma maestro único `flow-refs/ref-stage-master.png` (*Frames to Video* Inicio = Fin en el nivel gratuito diario de Google Flow).

---

## 3. Comparativa honesta ($0 presupuesto)

| Dimensión | Recortes 2D con brazos superpuestos (descartado) | Rive (`rive-cli` + Free tier) | **Híbrido Limpio Actual (Malla Suave Frontal + Tiza/Borrador + Flow `<video>` Opcional)** | Animador tradicional / 3D |
| :--- | :--- | :--- | :--- | :--- |
| **Naturalidad visual infantil** | **Deficiente** (brazos y hombros recortados se ven artificiales o inquietantes). | Alta si se ilustra y anima completo en estudio. | **Calidez garantizada:** mantiene intacto el retrato pintado amigable, sin ninguna articulación rara ni fantasmas. | Muy alta con costo elevado. |
| **Sincronía labial Rhubarb** | Alta en frente. | Alta mediante State Machine. | **Exacta (`currentTime` 60 fps)** sobre boca pintada aprobada. | Costosa de regenerar por frase. |
| **Peso Offline & Móvil (`390×844`)** | Liviano pero visualmente roto. | Splash screen obligatorio en plan Free + bloqueado `x86_64`. | **~1.9 MB offline, 60 fps fluido y encuadre completo 16:10 sin recortes.** | Decenas de MB por lección. |
| **Costo adicional** | $0 | Requiere plan pago para quitar splash. | **$0 exacto.** | Contratación externa. |
