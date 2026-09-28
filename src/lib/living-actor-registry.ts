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
  | "nod";

export type LivingActor = {
  src: string;
  action: LivingActorAction;
  creature: boolean;
  blinkFrame?: string;
  reducedMotion: "static";
  meaning: string;
};

const A = "/cartilla/art/faithful";

export const LIVING_ACTORS: Readonly<Record<string, LivingActor>> = Object.freeze({
  [`${A}/vocal-o/oso.webp`]: { src: `${A}/vocal-o/oso.webp`, action: "breathe", creature: true, blinkFrame: `${A}/vocal-o/oso-blink.webp`, reducedMotion: "static", meaning: "respiración y mirada natural" },
  [`${A}/vocal-o/oruga.webp`]: { src: `${A}/vocal-o/oruga.webp`, action: "crawl", creature: true, reducedMotion: "static", meaning: "avance corto de oruga" },
  [`${A}/vocal-a/abeja.webp`]: { src: `${A}/vocal-a/abeja.webp`, action: "hover", creature: true, reducedMotion: "static", meaning: "vuelo suspendido" },
  [`${A}/vocal-a/avion.webp`]: { src: `${A}/vocal-a/avion.webp`, action: "glide", creature: false, reducedMotion: "static", meaning: "desplazamiento de avión" },
  [`${A}/leccion-1/pajaro.webp`]: { src: `${A}/leccion-1/pajaro.webp`, action: "flutter", creature: true, reducedMotion: "static", meaning: "aleteo breve" },
  [`${A}/leccion-1/pez.webp`]: { src: `${A}/leccion-1/pez.webp`, action: "swim", creature: true, reducedMotion: "static", meaning: "nado lateral" },
  [`${A}/leccion-1/carro.webp`]: { src: `${A}/leccion-1/carro.webp`, action: "roll", creature: false, reducedMotion: "static", meaning: "rodar corto" },
  [`${A}/leccion-17-r/rueda.webp`]: { src: `${A}/leccion-17-r/rueda.webp`, action: "spin", creature: false, reducedMotion: "static", meaning: "giro de rueda" },
  [`${A}/leccion-17-r/rana.webp`]: { src: `${A}/leccion-17-r/rana.webp`, action: "hop", creature: true, reducedMotion: "static", meaning: "salto de rana" },
  [`${A}/leccion-18-rr/perro.webp`]: { src: `${A}/leccion-18-rr/perro.webp`, action: "wag", creature: true, reducedMotion: "static", meaning: "reacción juguetona" },
  [`${A}/leccion-19-g/gato.webp`]: { src: `${A}/leccion-19-g/gato.webp`, action: "nod", creature: true, reducedMotion: "static", meaning: "movimiento atento de cabeza/cuerpo" },
  [`${A}/leccion-7-m/mono.webp`]: { src: `${A}/leccion-7-m/mono.webp`, action: "nod", creature: true, reducedMotion: "static", meaning: "gesto atento" },
  [`${A}/leccion-9-s/sapo.webp`]: { src: `${A}/leccion-9-s/sapo.webp`, action: "hop", creature: true, reducedMotion: "static", meaning: "salto de sapo" },
});

export function getLivingActor(src: string): LivingActor | null {
  return LIVING_ACTORS[src] ?? null;
}
