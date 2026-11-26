import deliveryManifest from "../../public/cartilla/art/delivery/manifest.json";

const FAITHFUL_PREFIX = "/cartilla/art/faithful/";

// Owner-approved high-definition canonical masters supersede older 384/768
// derivative images so full-resolution artwork renders without downscale blur.
const CANONICAL_ONLY = new Set([
  "/cartilla/art/faithful/vocal-a/abeja.webp",
  "/cartilla/art/faithful/vocal-a/aguja.webp",
  "/cartilla/art/faithful/vocal-a/alas.webp",
  "/cartilla/art/faithful/vocal-a/anillo.webp",
  "/cartilla/art/faithful/vocal-a/arana.webp",
  "/cartilla/art/faithful/vocal-a/arbol.webp",
  "/cartilla/art/faithful/vocal-a/aro.webp",
  "/cartilla/art/faithful/vocal-a/avion.webp",
  "/cartilla/art/faithful/vocal-e/elefante.webp",
  "/cartilla/art/faithful/vocal-e/erizo.webp",
  "/cartilla/art/faithful/vocal-e/escalera.webp",
  "/cartilla/art/faithful/vocal-e/escoba.webp",
  "/cartilla/art/faithful/vocal-e/escuela.webp",
  "/cartilla/art/faithful/vocal-e/espejo.webp",
  "/cartilla/art/faithful/vocal-e/estrella.webp",
  "/cartilla/art/faithful/vocal-i/iglesia.webp",
  "/cartilla/art/faithful/vocal-i/iglu.webp",
  "/cartilla/art/faithful/vocal-i/igual.webp",
  "/cartilla/art/faithful/vocal-i/iguana.webp",
  "/cartilla/art/faithful/vocal-i/iman.webp",
  "/cartilla/art/faithful/vocal-i/indio.webp",
  "/cartilla/art/faithful/vocal-i/insecto.webp",
  "/cartilla/art/faithful/vocal-i/invierno.webp",
  "/cartilla/art/faithful/vocal-i/isla.webp",
  "/cartilla/art/faithful/vocal-o/ocho.webp",
  "/cartilla/art/faithful/vocal-o/ola.webp",
  "/cartilla/art/faithful/vocal-o/olla.webp",
  "/cartilla/art/faithful/vocal-o/oreja.webp",
  "/cartilla/art/faithful/vocal-o/oso-blink.webp",
  "/cartilla/art/faithful/vocal-o/oso.webp",
  "/cartilla/art/faithful/vocal-o/oveja.webp",
  "/cartilla/art/faithful/vocal-u/unicornio.webp",
  "/cartilla/art/faithful/vocal-u/uniforme.webp",
  "/cartilla/art/faithful/vocal-u/uno.webp",
  "/cartilla/art/faithful/vocal-u/uvas.webp",
  "/cartilla/art/faithful/vocal-u/uña.webp",
  "/cartilla/art/faithful/leccion-1/arco.webp",
  "/cartilla/art/faithful/leccion-1/carro.webp",
  "/cartilla/art/faithful/leccion-1/dulce.webp",
  "/cartilla/art/faithful/leccion-1/libro.webp",
  "/cartilla/art/faithful/leccion-1/maiz.webp",
  "/cartilla/art/faithful/leccion-1/manzana.webp",
  "/cartilla/art/faithful/leccion-1/ojos.webp",
  "/cartilla/art/faithful/leccion-1/pajaro.webp",
  "/cartilla/art/faithful/leccion-1/pera.webp",
  "/cartilla/art/faithful/leccion-1/pez.webp",
  "/cartilla/art/faithful/leccion-1/taza.webp",
  "/cartilla/art/faithful/leccion-1/traje.webp",
  "/cartilla/art/faithful/leccion-7-m/mama.webp",
  "/cartilla/art/faithful/leccion-7-m/mono.webp",
  "/cartilla/art/faithful/leccion-9-s/sapo.webp",
  "/cartilla/art/faithful/leccion-9-s/sopa.webp",
  "/cartilla/art/faithful/leccion-11-d/dado.webp",
  "/cartilla/art/faithful/leccion-13-n/nido.webp",
  "/cartilla/art/faithful/leccion-15-b/bebe.webp",
  "/cartilla/art/faithful/leccion-15-b/bota.webp",
  "/cartilla/art/faithful/leccion-16-v/vela.webp",
  "/cartilla/art/faithful/leccion-17-r/rana.webp",
  "/cartilla/art/faithful/leccion-17-r/remo.webp",
  "/cartilla/art/faithful/leccion-17-r/rita.webp",
  "/cartilla/art/faithful/leccion-17-r/rosa.webp",
  "/cartilla/art/faithful/leccion-17-r/rueda.webp",
  "/cartilla/art/faithful/leccion-18-rr/barril.webp",
  "/cartilla/art/faithful/leccion-18-rr/burro.webp",
  "/cartilla/art/faithful/leccion-18-rr/carrusel.webp",
  "/cartilla/art/faithful/leccion-18-rr/perro.webp",
  "/cartilla/art/faithful/leccion-18-rr/tierra.webp",
  "/cartilla/art/faithful/leccion-18-rr/torre.webp",
  "/cartilla/art/faithful/leccion-19-c/casa.webp",
  "/cartilla/art/faithful/leccion-19-c/catalina.webp",
  "/cartilla/art/faithful/leccion-19-c/conejo.webp",
  "/cartilla/art/faithful/leccion-19-c/cubo.webp",
  "/cartilla/art/faithful/leccion-19-c/cuna.webp",
  "/cartilla/art/faithful/leccion-19-g/gato.webp",
  "/cartilla/art/faithful/leccion-19-g/gaveta.webp",
  "/cartilla/art/faithful/leccion-19-g/goloso.webp",
  "/cartilla/art/faithful/leccion-19-g/gorra.webp",
  "/cartilla/art/faithful/leccion-19-g/gusano.webp",
  "/cartilla/art/faithful/leccion-19-g/mago.webp",
  "/cartilla/art/faithful/leccion-20-f/familia.webp",
  "/cartilla/art/faithful/leccion-20-f/felo.webp",
  "/cartilla/art/faithful/leccion-20-f/fideos.webp",
  "/cartilla/art/faithful/leccion-20-f/fiesta.webp",
  "/cartilla/art/faithful/leccion-20-f/foto.webp",
  "/cartilla/art/faithful/leccion-20-f/funda.webp",
  "/cartilla/art/faithful/leccion-21-j/jarra.webp",
  "/cartilla/art/faithful/leccion-21-j/jesus.webp",
  "/cartilla/art/faithful/leccion-21-j/jicotea.webp",
  "/cartilla/art/faithful/leccion-21-j/jirafa.webp",
  "/cartilla/art/faithful/leccion-21-j/jugo.webp",
  "/cartilla/art/faithful/leccion-22-y/mayuscula.webp",
  "/cartilla/art/faithful/leccion-22-y/yate.webp",
  "/cartilla/art/faithful/leccion-22-y/yayita.webp",
  "/cartilla/art/faithful/leccion-22-y/yema.webp",
  "/cartilla/art/faithful/leccion-22-y/yoyo.webp",
  "/cartilla/art/faithful/leccion-23-z/zapato.webp",
  "/cartilla/art/faithful/leccion-23-z/zepelin.webp",
  "/cartilla/art/faithful/leccion-23-z/zigzag.webp",
  "/cartilla/art/faithful/leccion-23-z/zulema.webp",
]);

export function isFaithfulCanonicalArt(src: string): boolean {
  return src.startsWith(FAITHFUL_PREFIX) && src.toLowerCase().endsWith(".webp");
}

export function getFaithfulDeliverySrc(src: string, width: 384 | 768): string {
  if (!isFaithfulCanonicalArt(src) || CANONICAL_ONLY.has(src)) return src;
  return `/cartilla/art/delivery/faithful/${width}/${src.slice(FAITHFUL_PREFIX.length)}`;
}

/**
 * Density-based candidates are intentional: workbook cards are generally
 * 100-300 CSS px wide. 384px covers normal displays and 768px covers retina.
 * The canonical src remains the fallback and source of truth.
 */
export function getFaithfulDeliverySrcSet(src: string): string | undefined {
  if (!isFaithfulCanonicalArt(src) || CANONICAL_ONLY.has(src)) return undefined;
  // Flip Chart-native cutouts are generated during prepare:art and are already
  // presentation-sized. They intentionally have no delivery derivative layer.
  if (src.startsWith(`${FAITHFUL_PREFIX}flipchart-native/`)) return undefined;

  const asset = deliveryManifest.assets.find((a) => a.canonicalSrc === src);
  if (!asset || !asset.derivatives || asset.derivatives.length === 0) {
    return `${getFaithfulDeliverySrc(src, 384)} 384w, ${getFaithfulDeliverySrc(src, 768)} 768w`;
  }

  const seenWidths = new Set<number>();
  const parts: string[] = [];

  for (const derivative of asset.derivatives) {
    if (!seenWidths.has(derivative.width)) {
      parts.push(`${derivative.path} ${derivative.width}w`);
      seenWidths.add(derivative.width);
    }
  }

  return parts.length > 0 ? parts.join(", ") : undefined;
}
