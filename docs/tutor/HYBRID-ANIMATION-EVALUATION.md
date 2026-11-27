# Evaluación Técnica — Arquitectura Híbrida de Animación ($0 Adicionales)

## 1. Investigación práctica de Rive (`rive-cli`, `@rive-app/react-canvas` y precios)

1. **Estado instalado en el proyecto:** El repositorio incluye `@rive-app/react-canvas` `4.35.0` en `package.json`, sin archivos `.riv` activos.
2. **Prueba empírica de `rive-cli` en este equipo:**
   - Comando ejecutado: `curl -fsSL https://releases.rive.app/cli/install.sh | sh`
   - Resultado real en este Mac Intel (`Darwin 25.6.0 / x86_64`): **`rive-cli is not shipped for macOS x86_64 yet`** (binario distribuido únicamente para Apple Silicon `arm64`, Linux `x86_64` o Windows).
   - Esto bloquea compilaciones locales de `.riv` en estaciones Intel macOS salvo que se use CI en Linux o una máquina M1/M2/M3/M4.
3. **Capacidad y restricciones de licencia ($0):**
   - El flujo con agentes (`rive.app/agents`, State Machines, Bones, Mesh Deformation, Constraints IK) permite construir personajes interactivos con peso mínimo (~150–400 KB por `.riv`).
   - **Restricción crítica gratuita:** Según las políticas de exportación vigentes (`rive.app/pricing`), las exportaciones del plan **Free** incorporan marca de agua / **splash screen de Rive** al iniciar salvo suscripción paga (Cadet/Voyager/Team). Bajo la regla estricta de **$0 gasto adicional**, un runtime con splash visible no es aceptable para la experiencia infantil.

---

## 2. Arquitectura Híbrida Implementada (`Mesh 2D + IK Analítico 2 Huesos + Rhubarb + Google Flow Opcional`)

Para lograr calidad natural sin cortes ni sensación de "calcomanía plana", y con **gasto exacto de $0**, se implementó un sistema híbrido nativo sobre Canvas 2D + SVG:

- **Deformación orgánica continua (`src/lib/tutor-mesh-rig.ts`):** Malla triangular `14×10` (`buildGretelBodyMesh`, `deformGretelMesh`) ponderada por huesos (cabeza, pecho respiratorio, rizos izquierdo y derecho con retardo de fase, lazo y giro cilíndrico 2.5D) que elimina por completo el movimiento en bloque rectangular.
- **Cinemática Inversa (IK) Analítica de 2 huesos (`solveTwoBoneIK`):** Articulación realista `hombro → codo redondeado → mano con tiza / borrador` resuelta por Ley de Cosenos 60 veces por segundo directamente hacia las coordenadas reales donde aparece la tiza y el borrador en la pizarra.
- **Compositor facial + Lip-Sync Rhubarb estricto (`TutorHybridStage.tsx`):** Las pupilas azules recortadas al ojo, párpados pintados en 5 etapas (`lid-25`..`lid-100`), cejas continuas y formas bucales (`A–G`/`X`) con coarticulación se componen al cuadro sobre el rostro frontal antes de deformar la malla y mezclar hacia la pose 3/4 izquierda (`pose-3q-left.png`).
- **Compatibilidad opcional con Google Flow:** El director (`src/lib/tutor-hybrid-director.ts`) reserva `GOOGLE_FLOW_CLIP_SLOTS` para incorporar los 10 clips silenciosos gratuitos de Google Flow cuando el propietario decida generarlos sin costo, manteniendo funcionamiento completo offline y sin dependencias externas.

---

## 3. Comparativa objetiva entre enfoques ($0 presupuesto)

| Dimensión | Implementación anterior (SVG/Framer Motion capas planas) | Rive (`rive-cli` + `@rive-app/react-canvas`) | **Híbrido Propuesto (Mesh 2D + IK + Rhubarb + Flow opcional)** | Blender Grease Pencil / Pre-render MP4 completo |
| :--- | :--- | :--- | :--- | :--- |
| **Calidad visual y fluidez** | Aceptable en reposo, se siente rígido al mover todo el retrato como capa plana; sin giro corporal ni brazo escribiendo. | Alta si se modela manualmente malla y máquina de estados en Rive Studio; requiere editor visual para pintura compleja. | **Muy natural:** malla suave en cabello/torso/giro, brazos reales con tiza y borrador fijados al trazo, sombra suave en pizarra, transiciones continuas sin cortes. | Excelente si un animador lo ilustra cuadro a cuadro; exige reconstruir identidad en estilo plano o 2.5D. |
| **Sincronía exacta con voz (Rhubarb `.visemes.json`)** | Muy alta (`currentTime` a 60 fps). | Alta mediante *Inputs* numéricos de State Machine desde React. | **Muy alta (`currentTime` 60 fps):** coarticulación directa `A–G`/`X` sincronizada al milisegundo con los audios aprobados. | Baja / rígida si se exporta video entero sin compositar boca viva. |
| **Interacción viva en pizarra** | Escrito SVG fijo con muñeca estática. | Requiere eventos JS ↔ Rive por cada palabra y sílaba dinámica. | **Directa y dinámica:** el IK sigue en tiempo real cualquier palabra, sílaba, subrayado o círculo de la lección actual. | Imposible adaptar texto dinámico de 40 lecciones sin generar decenas de videos. |
| **Compatibilidad Offline / PWA** | 100 % offline (~2 MB). | 100 % offline si no bloquea splash externo. | **100 % offline (~2.8 MB en PNG optimizados):** funciona sin internet en escuela o casa. | Mala para video masivo (decenas de MB por lección). |
| **Rendimiento móvil (`390×844`)** | 60 fps liviano. | 60 fps en WebGL/Canvas. | **60 fps fluido** (~280 triángulos/cuadro en Canvas 2D; <3 ms por cuadro en pruebas de navegador). | Alto consumo de batería y decodificación simultánea de múltiples `<video>`. |
| **Bloqueos / Costo actual** | **$0** (limitado visualmente). | **Bloqueado en Mac `x86_64`** (`rive-cli` solo Apple Silicon) y **splash obligatorio en plan Free**. | **$0 exacto.** Sin suscripciones, sin créditos en la nube obligatorios, listo para revisar hoy. | **$0** en software, pero `blender` no instalado y ~4–6 semanas de trabajo manual / rig complejo. |

---

## 4. Recomendación Técnica

**No reemplazar todavía la arquitectura de producción `TutorGretelPuppet` ni activar `layers/manifest.json` de forma permanente** hasta recibir aprobación visual del propietario sobre:
1. El pliego de poses (`pose-approval-sheet.png` — frente, 3/4 izquierda/derecha, brazo superior, tiza y borrador).
2. La demostración interactiva completa (`/tutor-hybrid-preview.html` y `/tutor/1?code=clase&slot=1&previewHybrid=1`).

Una vez aprobada por el propietario, promover el motor híbrido como modo principal dentro del PR #1073 mantiene los 4 modos FaceTime, la integridad de `gretel-approved-master.png`, las grabaciones aprobadas existentes y un gasto de **$0**.
