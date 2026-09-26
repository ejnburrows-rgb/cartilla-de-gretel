# GOOGLE FLOW PROMPTS — Cartilla de Gretel

Use Google Flow **Video → Frames**, upload the named source image as the **start frame**, and where the prompt calls for a loop upload the same image as the **end frame**. Select a supported 4-, 6-, or 8-second length as specified. Review the output against the source before using it. These are production briefs, not approved assets; reject any clip that changes the character or the printed artwork. Flow supports first/last frames and reference images, but video export does not by itself make a clean transparent cutout.

## 1. Gretel calm idle — six-second loop

Source: `public/cartilla/images/gretel/poses/gretel-idle.webp`; use this exact image for both start and end frames. Intended integration: a small, muted, pre-rendered character clip only while the visible page is settled and the child is not reading/tracing; the current original pose is the poster and reduced-motion fallback.

```text
Animate ONLY the supplied original illustration of Gretel. Six seconds, seamless return to the identical source pose. She is the same blonde girl with red bow, blue jumper, orange-striped shirt, same face, proportions, outline, colors and paper illustration texture. Her chest and shoulders move imperceptibly with one slow breath; she blinks once naturally near the middle and makes one tiny head adjustment. Feet stay planted. Static camera, fixed framing and scale, no pan, zoom, crop, lighting change or background motion. Start and end are pixel-composition matches to the supplied frame. No speaking or lip movement. No new flowers, sparkles, props, shadows, scenery, people, writing, border, or replacement character. No dancing, bobbing, swaying or exaggerated movement. Keep an uncluttered uniform background suitable for manual masking; do not invent transparency or checkerboard. The clip will be masked offline and placed in Gretel's safe book-edge area, never over lesson text.
```

## 2. Gretel entrance and exit — two four-second clips

Source: `gretel-wave-1.webp` and `gretel-idle.webp`. Make the entrance with wave as start and idle as end; make the exit with idle as start and wave as end. Intended integration: play once after a page turn settles and once at turn start, outside the printable page. Retain existing static poses as fallbacks.

```text
Create a restrained four-second transition between the two supplied ORIGINAL Gretel pose images, preserving her exact identity, blonde hair, red bow, blue jumper, orange-striped shirt, face, proportions, colors and illustration texture. Entrance: she moves into her exact book-edge standing position with a small single wave, then settles completely into the provided idle end frame. For the exit variant reverse that action: start exactly at idle, make one small goodbye gesture, then leave the visible safe area without crossing page content. Feet and body remain coherent, no morphing between different children. Locked camera and scale; static plain maskable background. No new clothing, dialogue text, magic effects, extra characters, generic chatbot bubble, flowers or invented book art. No camera move or background movement. The edit must begin/end on the supplied frames so the existing page-turn state machine can switch to and from original poses without a visual jump.
```

## 3. Gretel points to the exercise — four seconds

Source: `public/cartilla/images/gretel/poses/gretel-point-left.webp` (for a target to her left); use the same source as start and end. Intended integration: short once-only reaction after the exact DOM exercise target has been selected; the app draws the target highlight and positions Gretel safely, while the clip supplies only her gesture.

```text
Using ONLY the supplied original Gretel point-left illustration, make a four-second restrained pointing gesture. Her gaze and hand settle toward the LEFT without stepping, stretching, changing shape, or crossing the page. After the gesture she returns exactly to the supplied pose for a clean stop. Preserve the original face, blonde hair, red bow, blue jumper, orange-striped shirt, colors, linework and proportions. Fixed camera, unchanged size and framing, static plain maskable background. No floating arrows, letters, highlighted answer, extra hands, props, flowers, captions, camera movement or invented scenery. The workbook app, not the video, will anchor the highlight to the real exercise object. Do not loop this reaction.
```

## 4. Gretel brief mastery celebration — four seconds

Source: `public/cartilla/images/gretel/poses/gretel-cheer.webp`; use the same source as start and end. Intended integration: play once only on independent completion; keep reduced-motion poster frame.

```text
Four-second modest celebration using the supplied ORIGINAL Gretel cheer illustration as the only character reference. A small joyful arm and facial reaction, one light bounce at most, then stillness and an exact return to the source composition. Preserve her exact face, red bow, blonde hair, blue jumper, orange-striped shirt, body proportions and painterly outline. Lock the camera, framing, lighting and uniform maskable background. No confetti, stars, words, sound, new character, dancing loop, spinning, color shift or background changes. Do not cover instructional content; the app will place the clip beside the book and play it once at mastery.
```

## 5. Original cat micro-motion — six-second loop

Source: `public/cartilla/art/faithful/leccion-19-g/gato.webp`; same first and last frame. Intended integration: replace generic whole-image sway for that particular illustration only, in its existing page slot. The source still is the fallback.

```text
Animate the exact supplied original cat illustration for a six-second seamless loop. Keep its identity, silhouette, position, colors, linework, body proportions, edges and composition unchanged. The cat makes one small natural blink, a subtle breath, and a slight ear response, then returns to the exact original still. No walking, jumping, talking, anthropomorphic expression, extra tail, new animal or scene. Static camera and scale; freeze every background and surrounding illustration pixel. No motion of workbook text, borders or neighboring pictures. No zoom, crop, lighting shift, hallucinated texture or added flowers. This clip will occupy only the cat's existing illustration box and pause during focused reading and reduced motion.
```

## 6. Original elephant micro-motion — six-second loop

Source: `public/cartilla/art/faithful/vocal-e/elefante.webp`; same first and last frame. Intended integration: existing elephant illustration slot, with the still fallback.

```text
Six-second seamless micro-motion of ONLY the exact supplied original elephant. Preserve the recognizable original drawing, all contours, color, paper texture, proportions and placement. One gentle blink and one very small ear or trunk movement; return precisely to the source frame. No walking, spraying water, second elephant, altered tusks, invented background, extra flowers or anthropomorphic behavior. Static camera and framing. Freeze the paper, words, border and all other page elements. No zoom or crop. Use the clip only inside the original elephant illustration box; pause during focused exercises and use the static original image for reduced motion.
```

## Acceptance and integration

Reject a result if any source detail changes, the first/last frame jumps, the background cannot be cleanly isolated, or motion carries outside the source object's slot. Export the accepted muted clip; manually mask/crop offline; derive a matching poster frame; optimize for web; wire only that named asset into the existing lesson mapping. Play on visible settled pages, stop during turns and focused work, avoid simultaneous loops, and keep the original still for reduced motion and failed video load. The current CSS/page-turn/pose system stays in place until an approved clip actually exists.
