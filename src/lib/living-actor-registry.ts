export type LivingActorAction =
  | "breathe"
  | "crawl"
  | "flutter"
  | "swim"
  | "hover"
  | "glide"
  | "roll"
  | "spin"
  | "hop"
  | "wag"
  | "nod"
  | "sway"
  | "float";

export type LivingActorPart = {
  name: "wings" | "head" | "tail" | "ears" | "trunk";
  clipPath: string;
  transformOrigin: string;
};

export type LivingActor = {
  src: string;
  action: LivingActorAction;
  creature: boolean;
  blinkFrame?: string;
  /**
   * Self-animated SVG with the owner-approved natural part motion (Page 1,
   * owner 2026-10-06). When present it replaces whole-picture CSS motion and
   * blink-frame swapping; reduced motion shows the still `src` drawing.
   */
  aliveSrc?: string;
  parts?: LivingActorPart[];
  reducedMotion: "static";
  meaning: string;
};

const A = "/cartilla/art/faithful";
/** Workbook Page 1 display art (owner decision 2026-10-05). */
const W1 = "/cartilla/art/optimized/workbook/leccion-1";
const P1 = "/cartilla/art/faithful/leccion-1/wb-p1";
const FC_NATIVE = "/cartilla/art/optimized/flipchart-native";

export const LIVING_ACTORS: Readonly<Record<string, LivingActor>> = Object.freeze({
  // Flip Chart pilot picture (Lesson 7, page 9 scene)
  [`${FC_NATIVE}/p009-scene.png`]: {
    src: `${FC_NATIVE}/p009-scene.png`,
    aliveSrc: `${FC_NATIVE}/p009-scene-alive.svg`,
    action: "nod",
    creature: true,
    reducedMotion: "static",
    meaning: "gesto atento de cabeza y respiración natural",
  },
  // Flip Chart sheets (Láminas 4, 6, 7): same drawings as Workbook Page 1, same
  // approved part motion (scripts/living-motion/fc_natives.py).
  [`${FC_NATIVE}/p004-oso.png`]: { src: `${FC_NATIVE}/p004-oso.png`, aliveSrc: `${FC_NATIVE}/p004-oso-alive.svg`, action: "breathe", creature: true, reducedMotion: "static", meaning: "respiración, parpadeo y alas de la abeja" },
  [`${FC_NATIVE}/p004-oveja.png`]: { src: `${FC_NATIVE}/p004-oveja.png`, aliveSrc: `${FC_NATIVE}/p004-oveja-alive.svg`, action: "nod", creature: true, reducedMotion: "static", meaning: "parpadeo y oreja que se mueve" },
  [`${FC_NATIVE}/p004-olla.png`]: { src: `${FC_NATIVE}/p004-olla.png`, aliveSrc: `${FC_NATIVE}/p004-olla-alive.svg`, action: "float", creature: false, reducedMotion: "static", meaning: "vapor que sube de la olla" },
  [`${FC_NATIVE}/p006-elefante.png`]: { src: `${FC_NATIVE}/p006-elefante.png`, aliveSrc: `${FC_NATIVE}/p006-elefante-alive.svg`, action: "nod", creature: true, reducedMotion: "static", meaning: "trompa, orejas y parpadeo" },
  [`${FC_NATIVE}/p007-iman.png`]: { src: `${FC_NATIVE}/p007-iman.png`, aliveSrc: `${FC_NATIVE}/p007-iman-alive.svg`, action: "float", creature: false, reducedMotion: "static", meaning: "clips atraídos por el imán, líneas del campo y chispas" },
  // Original main sheet pictures, part motion only.
  [`${FC_NATIVE}/p015-sopa.png`]: {
    src: `${FC_NATIVE}/p015-sopa.png`,
    aliveSrc: `${FC_NATIVE}/p015-sopa-alive.svg`,
    action: "float",
    creature: false,
    reducedMotion: "static",
    meaning: "la superficie de la sopa ondula",
  },
  // Workbook Page 1 (owner color art / printed drawings): same meaning as the
  // faithful actors, whole-picture motion only (part rigs belong to other crops).
  [`${W1}/oso.svg`]: {
    src: `${W1}/oso.svg`,
    aliveSrc: `${W1}/oso-alive.svg`,
    action: "breathe",
    creature: true,
    blinkFrame: `${W1}/oso-blink.svg`,
    reducedMotion: "static",
    meaning: "respiración y mirada natural",
  },
  [`${W1}/oveja.svg`]: {
    src: `${W1}/oveja.svg`,
    aliveSrc: `${W1}/oveja-alive.svg`,
    action: "nod",
    creature: true,
    reducedMotion: "static",
    meaning: "gesto suave de oveja",
  },
  [`${W1}/avion.svg`]: {
    src: `${W1}/avion.svg`,
    aliveSrc: `${W1}/avion-alive.svg`,
    action: "glide",
    creature: false,
    reducedMotion: "static",
    meaning: "hélice que gira en la nariz del avión",
  },
  [`${W1}/abanico.svg`]: {
    src: `${W1}/abanico.svg`,
    aliveSrc: `${W1}/abanico-alive.svg`,
    action: "sway",
    creature: false,
    reducedMotion: "static",
    meaning: "abanico que se mece",
  },
  [`${W1}/elefante.svg`]: {
    src: `${W1}/elefante.svg`,
    aliveSrc: `${W1}/elefante-alive.svg`,
    action: "nod",
    creature: true,
    blinkFrame: `${W1}/elefante-blink.svg`,
    reducedMotion: "static",
    meaning: "trompa que se balancea, orejas que aletean y ojos que parpadean",
  },
  [`${W1}/iman.svg`]: {
    src: `${W1}/iman.svg`,
    aliveSrc: `${W1}/iman-alive.svg`,
    action: "float",
    creature: false,
    reducedMotion: "static",
    meaning: "chispas del imán que titilan",
  },
  [`${W1}/olla.svg`]: {
    src: `${W1}/olla.svg`,
    aliveSrc: `${W1}/olla-alive.svg`,
    action: "float",
    creature: false,
    reducedMotion: "static",
    meaning: "vapor que sube de la olla",
  },
  [`${W1}/abeja.png`]: {
    src: `${W1}/abeja.png`,
    action: "hover",
    creature: true,
    reducedMotion: "static",
    meaning: "vuelo suspendido de abeja",
  },
  [`${P1}/abeja.svg`]: {
    src: `${P1}/abeja.svg`,
    aliveSrc: `${P1}/abeja-alive.svg`,
    action: "hover",
    creature: true,
    reducedMotion: "static",
    meaning: "vuelo suspendido de abeja",
  },
  [`${A}/vocal-o/oso.webp`]: { src: `${A}/vocal-o/oso.webp`, aliveSrc: `${A}/vocal-o/oso-alive.svg`, action: "breathe", creature: true, blinkFrame: `${A}/vocal-o/oso-blink.webp`, reducedMotion: "static", meaning: "respiración y mirada natural" },
  [`${A}/vocal-o/oveja.webp`]: { src: `${A}/vocal-o/oveja.webp`, aliveSrc: `${A}/vocal-o/oveja-alive.svg`, action: "nod", creature: true, reducedMotion: "static", meaning: "gesto suave de oveja" },
  [`${A}/vocal-o/olla.webp`]: { src: `${A}/vocal-o/olla.webp`, aliveSrc: `${A}/vocal-o/olla-alive.svg`, action: "float", creature: false, reducedMotion: "static", meaning: "vapor que sube de la olla" },
  [`${A}/vocal-a/abeja.webp`]: { src: `${A}/vocal-a/abeja.webp`, aliveSrc: `${A}/vocal-a/abeja-alive.svg`, action: "hover", creature: true, parts: [{ name: "wings", clipPath: "inset(8% 8% 48% 8%)", transformOrigin: "50% 58%" }], reducedMotion: "static", meaning: "vuelo suspendido con aleteo" },
  [`${A}/vocal-a/avion.webp`]: { src: `${A}/vocal-a/avion.webp`, aliveSrc: `${A}/vocal-a/avion-alive.svg`, action: "glide", creature: false, reducedMotion: "static", meaning: "desplazamiento de avión" },
  [`${A}/vocal-a/abanico.webp`]: { src: `${A}/vocal-a/abanico.webp`, aliveSrc: `${A}/vocal-a/abanico-alive.svg`, action: "sway", creature: false, reducedMotion: "static", meaning: "abanico que se mece" },
  [`${A}/vocal-e/elefante.webp`]: { src: `${A}/vocal-e/elefante.webp`, aliveSrc: `${A}/vocal-e/elefante-alive.svg`, action: "nod", creature: true, parts: [{ name: "trunk", clipPath: "inset(20% 55% 18% 2%)", transformOrigin: "38% 45%" }], reducedMotion: "static", meaning: "trompa que se balancea con suavidad" },
  [`${A}/vocal-i/iman.webp`]: { src: `${A}/vocal-i/iman.webp`, aliveSrc: `${A}/vocal-i/iman-alive.svg`, action: "float", creature: false, reducedMotion: "static", meaning: "clips atraídos por el imán, líneas del campo y chispas" },
  // Lesson 3 remaining pictures, original main artwork. Only parts that are
  // drawn as separate pieces move (owner rule 2026-10-11). Other actors remain unchanged.
  [`${A}/vocal-o/oruga.webp`]: {
    src: `${A}/vocal-o/oruga.webp`,
    aliveSrc: `${A}/vocal-o/oruga-alive.svg`,
    action: "nod",
    creature: true,
    reducedMotion: "static",
    meaning: "la mano de la oruga saluda",
  },
  [`${A}/vocal-a/ardilla.webp`]: {
    src: `${A}/vocal-a/ardilla.webp`,
    aliveSrc: `${A}/vocal-a/ardilla-alive.svg`,
    action: "wag",
    creature: true,
    reducedMotion: "static",
    meaning: "la cola de la ardilla se mece",
  },
  [`${A}/vocal-a/alas.webp`]: {
    src: `${A}/vocal-a/alas.webp`,
    aliveSrc: `${A}/vocal-a/alas-alive.svg`,
    action: "flutter",
    creature: false,
    reducedMotion: "static",
    meaning: "las alas aletean un poco",
  },
  [`${A}/leccion-1/ojos.webp`]: {
    src: `${A}/leccion-1/ojos.webp`,
    aliveSrc: `${A}/leccion-1/ojos-alive.svg`,
    action: "nod",
    creature: true,
    reducedMotion: "static",
    meaning: "las pupilas cambian suavemente de mirada",
  },
  [`${A}/vocal-e/estrella.webp`]: {
    src: `${A}/vocal-e/estrella.webp`,
    aliveSrc: `${A}/vocal-e/estrella-alive.svg`,
    action: "float",
    creature: false,
    reducedMotion: "static",
    meaning: "la estrella original permanece quieta",
  },
  [`${A}/vocal-a/aguja.webp`]: {
    src: `${A}/vocal-a/aguja.webp`,
    aliveSrc: `${A}/vocal-a/aguja-alive.svg`,
    action: "sway",
    creature: false,
    reducedMotion: "static",
    meaning: "el extremo libre del hilo se mueve un poco",
  },
  [`${A}/leccion-1/maiz.webp`]: {
    src: `${A}/leccion-1/maiz.webp`,
    aliveSrc: `${A}/leccion-1/maiz-alive.svg`,
    action: "sway",
    creature: false,
    reducedMotion: "static",
    meaning: "una hoja del maíz se dobla",
  },
  // Lesson 1 original main pictures; other actors remain unchanged.
  [`${A}/vocal-e/escoba.webp`]: {
    src: `${A}/vocal-e/escoba.webp`,
    aliveSrc: `${A}/vocal-e/escoba-alive.svg`,
    action: "sway",
    creature: false,
    reducedMotion: "static",
    meaning: "las cerdas de la escoba se mecen",
  },
  // Lesson 4 original main picture, also on Lesson 6; the drawn eye stays closed.
  [`${A}/vocal-u/unicornio.webp`]: {
    src: `${A}/vocal-u/unicornio.webp`,
    aliveSrc: `${A}/vocal-u/unicornio-alive.svg`,
    action: "nod",
    creature: true,
    reducedMotion: "static",
    meaning: "la oreja del unicornio se mueve",
  },
  // Held still (owner rule 2026-10-11: only the parts that really move may move;
  // whole pictures never bob, tilt, breathe or slide). Their old whole-picture
  // motion moved the drawn ground/background too: araña, erizo, iguana, insecto.
  // Part motion for them needs owner approval. (oruga, ardilla and unicornio now have
  // part-only motion on their original artwork, above; draft, owner approval pending.)

  [`${A}/leccion-1/aguila.webp`]: { src: `${A}/leccion-1/aguila.webp`, action: "flutter", creature: true, parts: [{ name: "wings", clipPath: "inset(8% 4% 42% 4%)", transformOrigin: "50% 62%" }], reducedMotion: "static", meaning: "aleteo breve de águila" },
  [`${A}/leccion-1/pajaro.webp`]: { src: `${A}/leccion-1/pajaro.webp`, action: "flutter", creature: true, parts: [{ name: "wings", clipPath: "inset(10% 6% 44% 6%)", transformOrigin: "50% 60%" }], reducedMotion: "static", meaning: "aleteo breve de pájaro" },
  // leccion-1/pez.webp is the Workbook's AIRPLANE (book pages 8, 13, 16; see
  // book-transcription notes "picture-identity"); the file name is historical.
  // A flying airplane is the one thing that may travel gently as a whole.
  [`${A}/leccion-1/pez.webp`]: { src: `${A}/leccion-1/pez.webp`, action: "glide", creature: false, reducedMotion: "static", meaning: "avión que vuela" },
  // carro: original yellow P-511 vintage car from main. Its old CSS rolled the whole drawing; now only
  // the original wheel details turn in their own planes. The car body stays still.
  [`${A}/leccion-1/carro.webp`]: {
    src: `${A}/leccion-1/carro.webp`,
    aliveSrc: `${A}/leccion-1/carro-alive.svg`,
    action: "roll",
    creature: false,
    reducedMotion: "static",
    meaning: "las ruedas giran; el carro queda quieto",
  },
  [`${A}/leccion-1/globo.webp`]: { src: `${A}/leccion-1/globo.webp`, action: "float", creature: false, reducedMotion: "static", meaning: "flotación de globo" },

  [`${A}/leccion-17-r/rueda.webp`]: { src: `${A}/leccion-17-r/rueda.webp`, action: "spin", creature: false, reducedMotion: "static", meaning: "giro de rueda" },
  [`${A}/leccion-17-r/rana.webp`]: { src: `${A}/leccion-17-r/rana.webp`, action: "hop", creature: true, reducedMotion: "static", meaning: "salto de rana" },
  [`${A}/leccion-18-rr/burro.webp`]: { src: `${A}/leccion-18-rr/burro.webp`, action: "nod", creature: true, reducedMotion: "static", meaning: "movimiento atento del burro" },
  [`${A}/leccion-18-rr/carrusel.webp`]: { src: `${A}/leccion-18-rr/carrusel.webp`, action: "spin", creature: false, reducedMotion: "static", meaning: "giro del carrusel" },
  [`${A}/leccion-18-rr/perro.webp`]: { src: `${A}/leccion-18-rr/perro.webp`, action: "wag", creature: true, parts: [{ name: "tail", clipPath: "inset(28% 0 18% 62%)", transformOrigin: "66% 65%" }], reducedMotion: "static", meaning: "reacción juguetona con cola" },
  [`${A}/leccion-19-c/conejo.webp`]: { src: `${A}/leccion-19-c/conejo.webp`, action: "hop", creature: true, parts: [{ name: "ears", clipPath: "inset(0 18% 55% 12%)", transformOrigin: "48% 45%" }], reducedMotion: "static", meaning: "orejas que reaccionan antes del salto" },
  [`${A}/leccion-19-g/gato.webp`]: { src: `${A}/leccion-19-g/gato.webp`, action: "nod", creature: true, reducedMotion: "static", meaning: "movimiento atento de cabeza/cuerpo" },
  [`${A}/leccion-19-g/gusano.webp`]: { src: `${A}/leccion-19-g/gusano.webp`, action: "crawl", creature: true, reducedMotion: "static", meaning: "avance de gusano" },
  [`${A}/leccion-21-j/jicotea.webp`]: { src: `${A}/leccion-21-j/jicotea.webp`, action: "crawl", creature: true, reducedMotion: "static", meaning: "avance lento de jicotea" },
  [`${A}/leccion-21-j/jirafa.webp`]: { src: `${A}/leccion-21-j/jirafa.webp`, action: "nod", creature: true, reducedMotion: "static", meaning: "movimiento suave de jirafa" },
  [`${A}/leccion-22-y/yate.webp`]: { src: `${A}/leccion-22-y/yate.webp`, action: "glide", creature: false, reducedMotion: "static", meaning: "desplazamiento de yate" },
  [`${A}/leccion-22-y/yoyo.webp`]: { src: `${A}/leccion-22-y/yoyo.webp`, action: "spin", creature: false, reducedMotion: "static", meaning: "giro del yoyó" },
  [`${A}/leccion-23-z/zepelin.webp`]: { src: `${A}/leccion-23-z/zepelin.webp`, action: "glide", creature: false, reducedMotion: "static", meaning: "desplazamiento de zepelín" },
  [`${A}/leccion-23-z/zorro.webp`]: { src: `${A}/leccion-23-z/zorro.webp`, action: "wag", creature: true, parts: [{ name: "tail", clipPath: "inset(26% 0 16% 58%)", transformOrigin: "62% 66%" }], reducedMotion: "static", meaning: "reacción atenta del zorro con cola" },

  [`${A}/leccion-7-m/mono.webp`]: { src: `${A}/leccion-7-m/mono.webp`, action: "nod", creature: true, parts: [{ name: "head", clipPath: "inset(0 22% 52% 22%)", transformOrigin: "50% 46%" }], reducedMotion: "static", meaning: "gesto atento de cabeza" },
  [`${A}/leccion-9-s/sapo.webp`]: { src: `${A}/leccion-9-s/sapo.webp`, action: "hop", creature: true, reducedMotion: "static", meaning: "salto de sapo" },
});

export function getLivingActor(src: string): LivingActor | null {
  return LIVING_ACTORS[src] ?? null;
}
