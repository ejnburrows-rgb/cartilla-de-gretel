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
  parts?: LivingActorPart[];
  reducedMotion: "static";
  meaning: string;
};

const A = "/cartilla/art/faithful";

export const LIVING_ACTORS: Readonly<Record<string, LivingActor>> = Object.freeze({
  [`${A}/vocal-o/oso.webp`]: { src: `${A}/vocal-o/oso.webp`, action: "breathe", creature: true, blinkFrame: `${A}/vocal-o/oso-blink.webp`, reducedMotion: "static", meaning: "respiración y mirada natural" },
  [`${A}/vocal-o/oruga.webp`]: { src: `${A}/vocal-o/oruga.webp`, action: "crawl", creature: true, reducedMotion: "static", meaning: "avance corto de oruga" },
  [`${A}/vocal-o/oveja.webp`]: { src: `${A}/vocal-o/oveja.webp`, action: "nod", creature: true, reducedMotion: "static", meaning: "gesto suave de oveja" },
  [`${A}/vocal-a/abeja.webp`]: { src: `${A}/vocal-a/abeja.webp`, action: "hover", creature: true, parts: [{ name: "wings", clipPath: "inset(8% 8% 48% 8%)", transformOrigin: "50% 58%" }], reducedMotion: "static", meaning: "vuelo suspendido con aleteo" },
  [`${A}/vocal-a/arana.webp`]: { src: `${A}/vocal-a/arana.webp`, action: "crawl", creature: true, reducedMotion: "static", meaning: "paso corto de araña" },
  [`${A}/vocal-a/ardilla.webp`]: { src: `${A}/vocal-a/ardilla.webp`, action: "hop", creature: true, reducedMotion: "static", meaning: "salto corto de ardilla" },
  [`${A}/vocal-a/avion.webp`]: { src: `${A}/vocal-a/avion.webp`, action: "glide", creature: false, reducedMotion: "static", meaning: "desplazamiento de avión" },
  [`${A}/vocal-a/abanico.webp`]: { src: `${A}/vocal-a/abanico.webp`, action: "sway", creature: false, reducedMotion: "static", meaning: "abanico que se mece" },
  [`${A}/vocal-e/elefante.webp`]: { src: `${A}/vocal-e/elefante.webp`, action: "nod", creature: true, parts: [{ name: "trunk", clipPath: "inset(20% 55% 18% 2%)", transformOrigin: "38% 45%" }], reducedMotion: "static", meaning: "trompa que se balancea con suavidad" },
  [`${A}/vocal-e/erizo.webp`]: { src: `${A}/vocal-e/erizo.webp`, action: "breathe", creature: true, reducedMotion: "static", meaning: "respiración discreta" },
  [`${A}/vocal-i/iguana.webp`]: { src: `${A}/vocal-i/iguana.webp`, action: "crawl", creature: true, reducedMotion: "static", meaning: "avance lento de iguana" },
  [`${A}/vocal-i/insecto.webp`]: { src: `${A}/vocal-i/insecto.webp`, action: "crawl", creature: true, reducedMotion: "static", meaning: "movimiento breve de insecto" },
  [`${A}/vocal-u/unicornio.webp`]: { src: `${A}/vocal-u/unicornio.webp`, action: "nod", creature: true, reducedMotion: "static", meaning: "gesto amable de unicornio" },

  [`${A}/leccion-1/aguila.webp`]: { src: `${A}/leccion-1/aguila.webp`, action: "flutter", creature: true, parts: [{ name: "wings", clipPath: "inset(8% 4% 42% 4%)", transformOrigin: "50% 62%" }], reducedMotion: "static", meaning: "aleteo breve de águila" },
  [`${A}/leccion-1/pajaro.webp`]: { src: `${A}/leccion-1/pajaro.webp`, action: "flutter", creature: true, parts: [{ name: "wings", clipPath: "inset(10% 6% 44% 6%)", transformOrigin: "50% 60%" }], reducedMotion: "static", meaning: "aleteo breve de pájaro" },
  [`${A}/leccion-1/pez.webp`]: { src: `${A}/leccion-1/pez.webp`, action: "swim", creature: true, parts: [{ name: "tail", clipPath: "inset(32% 66% 18% 0)", transformOrigin: "34% 58%" }], reducedMotion: "static", meaning: "cola que impulsa el nado" },
  [`${A}/leccion-1/carro.webp`]: { src: `${A}/leccion-1/carro.webp`, action: "roll", creature: false, reducedMotion: "static", meaning: "rodar corto" },
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

  [`${A}/leccion-7-m/mono.webp`]: { src: `${A}/leccion-7-m/mono.webp`, action: "nod", creature: true, blinkFrame: `${A}/leccion-7-m/mono-blink.webp`, parts: [{ name: "head", clipPath: "inset(0 22% 52% 22%)", transformOrigin: "50% 46%" }], reducedMotion: "static", meaning: "gesto atento de cabeza" },
  [`${A}/leccion-9-s/sapo.webp`]: { src: `${A}/leccion-9-s/sapo.webp`, action: "hop", creature: true, blinkFrame: `${A}/leccion-9-s/sapo-blink.webp`, reducedMotion: "static", meaning: "salto de sapo" },
});

export function getLivingActor(src: string): LivingActor | null {
  return LIVING_ACTORS[src] ?? null;
}
