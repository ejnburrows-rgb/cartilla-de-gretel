/**
 * Configuración central de marca (branding).
 *
 * Único punto donde se definen el nombre del producto, la autora, la editorial
 * y los textos visibles más importantes. Cualquier pantalla, meta tag, manifest
 * o exportable debe leer desde aquí en lugar de hardcodear el texto.
 *
 * Si necesitas cambiar el nombre del producto o el copyright, edita ESTE
 * archivo y los cambios se reflejarán en todas las pantallas que ya lo importan.
 */

export const BRANDING = {
  productName: "La Cartilla de Gretel",
  productTagline: "Edición digital interactiva — método fonético K-2.",
  shortName: "Cartilla",
  author: "Leonor Lopetegui",
  publisher: "Lanny Books",
  publisherEstablished: 2004,
  supportEmail: "info@cartilladegretel.com",
  description:
    "Edición digital interactiva de La Cartilla de Gretel — método fonético K-2 con 24 lecciones, ejercicios y panel de maestro.",
  // Colores principales (referencia, los tokens reales viven en src/styles.css)
  themeColor: "#3b82f6",
} as const;

export function pageTitle(section?: string): string {
  return section ? `${section} — ${BRANDING.productName}` : BRANDING.productName;
}

export function copyrightLine(): string {
  return `© ${new Date().getFullYear()} LANY BOOKS LLC · ${BRANDING.author}`;
}

export function assetPath(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${path.replace(/^\/+/, "")}`;
}

export function routePath(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
