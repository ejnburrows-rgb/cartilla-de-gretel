import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const oldCropsPath = path.join(rootDir, "docs", "art-board", "old-crops-replacement-inventory.json");
const masterMappingPath = path.join(rootDir, "docs", "artwork-reconciliation", "mapping", "MASTER-MAPPING.csv");

const oldCrops = JSON.parse(fs.readFileSync(oldCropsPath, "utf8"));
const csvLines = fs.readFileSync(masterMappingPath, "utf8").split("\n").filter(Boolean);

// Parse CSV
const needsOptMap = new Map();
for (let i = 1; i < csvLines.length; i++) {
  const parts = csvLines[i].split(",");
  if (parts.length >= 10) {
    const groupStatus = parts[6];
    const groupLabel = parts[5];
    const pageSheet = parts[2];
    const book = parts[1];
    const dest = parts[10];
    const crop = parts[8];
    if (groupStatus === "NEEDS OPTIMIZATION" || groupStatus === "UNRESOLVED") {
      if (!needsOptMap.has(groupLabel)) {
        needsOptMap.set(groupLabel, {
          label: groupLabel,
          book,
          pageSheet,
          dest,
          crop,
          status: groupStatus
        });
      }
    }
  }
}

console.log(`Found ${oldCrops.length} old crops inventory items and ${needsOptMap.size} unoptimized master mapping groups`);

// Build Markdown Document
let md = `# LA CARTILLA DE GRETEL — DOCUMENTO MAESTRO DE ARTE (SOURCE OF TRUTH)
**Fecha:** 2026-11-01  
**Ubicación de entrega local:** \`C:\\Users\\EJN\\Downloads\\Cartilla-Drop\\\`  
**Ubicación en el repositorio:** \`public/cartilla/art/\`

Este documento es la **fuente de verdad oficial** para subir, reemplazar y verificar cada una de las imágenes que necesitan ser optimizadas, coloreadas o corregidas en el Cuaderno de Trabajo y en el Flip Chart de la Maestra.

---

## 🚀 CÓMO SUBIR TUS IMÁGENES (EN 1 PASO)

Puedes guardar tus imágenes terminadas directamente en la carpeta:
📁 **\`C:\\Users\\EJN\\Downloads\\Cartilla-Drop\\\`**

Tan pronto como coloques cualquier imagen con el nombre indicado en la tabla, el sistema:
1. Lo toma como **Master Canónico Aprobado**.
2. Actualiza **todas las páginas y lecciones donde se repite**.
3. **Elimina simultáneamente del repositorio todas las copias viejas y recortes defectuosos**.

---

## 🌟 PRIORIDAD P0: PORTADA DEL LIBRO (SPLASH SCREEN COVER)
| Nombre sugerido | Dónde se usa | Qué se necesita |
| :--- | :--- | :--- |
| **\`cover.png\`** (o \`portada.png\`) | Portada 3D del libro al abrir la app (\`/\`) | Tu nueva portada del libro ilustrada para el efecto 3D |

---

## 🎨 PRIORIDAD 1: ÍCONOS DE LAS 24 LECCIONES (TARJETAS DE SELECCIÓN)
Estas son las imágenes que aparecen en las tarjetas de **"Mis lecciones"**. Muchas tienen cajas blancas cuadradas que deben ser eliminadas para que floten limpiamente sobre el fondo crema:

| Lección | Letra / Nombre | Nombre de archivo a subir | Estado actual / Defecto a corregir |
| :---: | :--- | :--- | :--- |
| **1** | **AEIOU** (Portada) | \`cover.png\` | Portada del cuaderno |
| **2** | **O** · oso | \`oso.webp\` | Recorte del Flip Chart |
| **3** | **A** · ardilla | \`ardilla.webp\` | **RESUELTO (Nueva ardilla aprobada)** |
| **4** | **E** · elefante | \`elefante.webp\` | Recorte del Flip Chart |
| **5** | **I** · iglú | \`iglu.webp\` | Recorte del Flip Chart |
| **6** | **U** · uva | \`uva.webp\` | Recorte del Flip Chart |
| **7** | **M** · mamá | \`mama.webp\` | Fondo blanco cuadrado sólido |
| **8** | **P** · papá | \`papa.webp\` | Fondo blanco cuadrado sólido |
| **9** | **S** · Sesi / sapo | \`sesi.webp\` o \`sapo.webp\` | Fondo blanco cuadrado sólido |
| **10** | **T** · tomate | \`tomate.webp\` | Fondo blanco cuadrado sólido |
| **11** | **D** · Didi / dados | \`didi.webp\` | Fondo blanco cuadrado sólido |
| **12** | **L** · maleta / lata | \`maleta.webp\` | Fondo blanco cuadrado sólido |
| **13** | **N** · nido | \`nido.webp\` | Fondo blanco cuadrado sólido |
| **14** | **Ñ** · piñata | \`pinata.webp\` | Fondo blanco cuadrado sólido |
| **15** | **B** · Beba / bota | \`beba.webp\` | Fondo blanco cuadrado sólido |
| **16** | **V** · vaso | \`vaso.webp\` | **En blanco y negro / sin color** |
| **17** | **R** · rana | \`rana.webp\` | Color existente |
| **18** | **RR** · burro / carrusel | \`burro.webp\` | Color existente |
| **19** | **G** · gaveta | \`gaveta.webp\` | Color existente |
| **20** | **F** · foto | \`foto.webp\` | Fondo blanco cuadrado sólido |
| **21** | **J** · jicotea | \`jicotea.webp\` | Color existente |
| **22** | **C** · cuna | \`cuna.webp\` | Color existente |
| **23** | **Y** · yate | \`yate.webp\` | **Recorte cuadrado tosco con marco cortado** |
| **24** | **Z** · zapato | \`zapato.webp\` | Color con borde circular |

---

## 📋 PRIORIDAD 2: INVENTARIO DE ILUSTRACIONES DEL CUADERNO & FLIP CHART
Lista completa de ilustraciones que requieren reemplazo o verificación de color original:

| # | Palabra / Sujeto | Libro y Página | Nombre de archivo a subir | Motivo / Estado |
| :---: | :--- | :--- | :--- | :--- |
`;

let count = 1;
oldCrops.forEach(item => {
  md += `| ${count++} | **${item.appLabel || item.word}** | ${item.book} (Pág. ${item.page}) | \`${item.suggestedDropName || (item.word + ".webp")}\` | ${item.whyOldCrop} |\n`;
});

// Write Markdown to both destinations
const dropMdPath = "C:/Users/EJN/Downloads/Cartilla-Drop/ARTWORK_SOURCE_OF_TRUTH.md";
const repoMdPath = path.join(rootDir, "docs", "ARTWORK_SOURCE_OF_TRUTH.md");
const rootMdPath = path.join(rootDir, "ARTWORK_SOURCE_OF_TRUTH.md");

fs.writeFileSync(dropMdPath, md, "utf8");
fs.writeFileSync(repoMdPath, md, "utf8");
fs.writeFileSync(rootMdPath, md, "utf8");
console.log("Saved Markdown to:", dropMdPath, repoMdPath);

// Generate Double-Clickable Self-Contained HTML Document
let html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>La Cartilla de Gretel — Documento Maestro de Subida de Arte</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fdfbf7; color: #2c2523; margin: 0; padding: 24px; line-height: 1.5; }
    .container { max-width: 1100px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e8dfd5; }
    h1 { color: #5c3826; margin-top: 0; font-size: 28px; }
    .hero { background: #fdf5ed; border: 2px dashed #d4a373; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .hero h3 { margin-top: 0; color: #8c4a22; }
    .folder-path { background: #2c2523; color: #f4eee7; padding: 8px 14px; border-radius: 6px; font-family: monospace; font-size: 15px; display: inline-block; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 32px; font-size: 14px; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #eee5dc; text-align: left; }
    th { background: #f8f3ed; color: #5c3826; font-weight: 700; }
    tr:hover { background: #faf7f2; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .badge-p0 { background: #fee2e2; color: #991b1b; }
    .badge-p1 { background: #fef3c7; color: #92400e; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .filename { font-family: monospace; font-weight: bold; color: #1e40af; background: #eff6ff; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 La Cartilla de Gretel — Documento Maestro de Arte (Source of Truth)</h1>
    <div class="hero">
      <h3>📁 Carpeta Oficial de Entrega en tu Computadora:</h3>
      <p>Guarda cualquier imagen terminada directamente en esta carpeta:</p>
      <div class="folder-path">C:\\Users\\EJN\\Downloads\\Cartilla-Drop\\</div>
      <p style="margin-bottom:0; margin-top:12px; font-size:13px; color:#6b5d52;">El sistema toma automáticamente cada archivo por su nombre, actualiza todas las páginas donde se repite y elimina las copias viejas del repositorio.</p>
    </div>

    <h2>1. Portada del Libro (Splash Screen Cover)</h2>
    <table>
      <thead>
        <tr><th>Prioridad</th><th>Nombre de Archivo a Subir</th><th>Dónde se usa</th><th>Detalle</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-p0">P0 URGENTE</span></td>
          <td><span class="filename">cover.png</span></td>
          <td>Portada 3D al abrir la Cartilla</td>
          <td>Tu nueva portada ilustrada para la animación de apertura del libro físico.</td>
        </tr>
      </tbody>
    </table>

    <h2>2. Íconos de las 24 Lecciones (Tarjetas de Selección)</h2>
    <p>Estas imágenes se muestran en la pantalla de "Mis lecciones". Muchas tienen fondos blancos cuadrados que deben ser corregidos:</p>
    <table>
      <thead>
        <tr><th>Lección</th><th>Letra / Palabra</th><th>Nombre de Archivo</th><th>Defecto Actual en Demo</th></tr>
      </thead>
      <tbody>
        <tr><td>L1</td><td>AEIOU (Portada)</td><td><span class="filename">cover.png</span></td><td>Portada</td></tr>
        <tr><td>L2</td><td>O · oso</td><td><span class="filename">oso.webp</span></td><td>Recorte del Flip Chart</td></tr>
        <tr><td>L3</td><td>A · ardilla</td><td><span class="filename">ardilla.webp</span></td><td><span class="badge badge-ok">✓ YA INSTALADA (Ardilla aprobada)</span></td></tr>
        <tr><td>L4</td><td>E · elefante</td><td><span class="filename">elefante.webp</span></td><td>Recorte del Flip Chart</td></tr>
        <tr><td>L5</td><td>I · iglú</td><td><span class="filename">iglu.webp</span></td><td>Recorte del Flip Chart</td></tr>
        <tr><td>L6</td><td>U · uva</td><td><span class="filename">uva.webp</span></td><td>Recorte del Flip Chart</td></tr>
        <tr><td>L7</td><td>M · mamá</td><td><span class="filename">mama.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L8</td><td>P · papá</td><td><span class="filename">papa.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L9</td><td>S · Sesi / sapo</td><td><span class="filename">sesi.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L10</td><td>T · tomate</td><td><span class="filename">tomate.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L11</td><td>D · Didi / dados</td><td><span class="filename">didi.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L12</td><td>L · maleta / lata</td><td><span class="filename">maleta.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L13</td><td>N · nido</td><td><span class="filename">nido.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L14</td><td>Ñ · piñata</td><td><span class="filename">pinata.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L15</td><td>B · Beba</td><td><span class="filename">beba.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L16</td><td>V · vaso</td><td><span class="filename">vaso.webp</span></td><td><span class="badge badge-p0">EN BLANCO Y NEGRO (Sin color)</span></td></tr>
        <tr><td>L17</td><td>R · rana</td><td><span class="filename">rana.webp</span></td><td>Color existente</td></tr>
        <tr><td>L18</td><td>RR · burro</td><td><span class="filename">burro.webp</span></td><td>Color existente</td></tr>
        <tr><td>L19</td><td>G · gaveta</td><td><span class="filename">gaveta.webp</span></td><td>Color existente</td></tr>
        <tr><td>L20</td><td>F · foto</td><td><span class="filename">foto.webp</span></td><td><span class="badge badge-p1">Fondo blanco cuadrado sólido</span></td></tr>
        <tr><td>L21</td><td>J · jicotea</td><td><span class="filename">jicotea.webp</span></td><td>Color existente</td></tr>
        <tr><td>L22</td><td>C · cuna</td><td><span class="filename">cuna.webp</span></td><td>Color existente</td></tr>
        <tr><td>L23</td><td>Y · yate</td><td><span class="filename">yate.webp</span></td><td><span class="badge badge-p0">RECORTE CUADRADO TOSCO</span></td></tr>
        <tr><td>L24</td><td>Z · zapato</td><td><span class="filename">zapato.webp</span></td><td>Color con borde circular</td></tr>
      </tbody>
    </table>

    <h2>3. Lista Completa de Ilustraciones a Reemplazar / Optimizar</h2>
    <table>
      <thead>
        <tr><th>#</th><th>Palabra / Dibujo</th><th>Libro y Página</th><th>Nombre de Archivo Sugerido</th><th>Problema Actual</th></tr>
      </thead>
      <tbody>
`;

oldCrops.forEach((item, idx) => {
  html += `        <tr><td>${idx + 1}</td><td><strong>${item.appLabel || item.word}</strong></td><td>${item.book} (Pág. ${item.page})</td><td><span class="filename">${item.suggestedDropName || (item.word + ".webp")}</span></td><td>${item.whyOldCrop}</td></tr>\n`;
});

html += `      </tbody>
    </table>
  </div>
</body>
</html>`;

const dropHtmlPath = "C:/Users/EJN/Downloads/Cartilla-Drop/ARTWORK_MASTER_INVENTORY_AND_UPLOAD_GUIDE.html";
const repoHtmlPath = path.join(rootDir, "docs", "ARTWORK_MASTER_INVENTORY_AND_UPLOAD_GUIDE.html");

fs.writeFileSync(dropHtmlPath, html, "utf8");
fs.writeFileSync(repoHtmlPath, html, "utf8");
console.log("Saved HTML documents to:", dropHtmlPath, repoHtmlPath);
