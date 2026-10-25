import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CSV_PATH = "docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv";
export const MD_PATH = "docs/artwork-reconciliation/mapping/MASTER-MAPPING.md";
export const POINTER_PATH = "docs/ARTWORK_MAPPING_CANONICAL.md";

// Quoted commas, escaped quotes and CRLF are present in the existing master.
export function parseMapping(text) {
  const records = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) { row.push(field); field = ""; }
    else if ((ch === "\r" || ch === "\n") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); if (row.some(Boolean)) records.push(row);
      row = []; field = "";
    } else field += ch;
  }
  if (quoted) throw new Error("Unclosed quoted CSV field");
  if (field || row.length) { row.push(field); records.push(row); }
  const headers = records.shift();
  for (const required of ["artwork_id", "drawing_group_id", "group_status", "placement_status", "source_crop_path", "destination_path"]) {
    if (!headers?.includes(required)) throw new Error(`Missing mapping column: ${required}`);
  }
  const seen = new Set();
  return records.map((values) => {
    if (values.length !== headers.length) throw new Error("Wrong CSV column count");
    const item = Object.fromEntries(headers.map((key, i) => [key, values[i]]));
    if (!item.artwork_id || !item.drawing_group_id || seen.has(item.artwork_id)) throw new Error(`Missing or duplicate placement: ${item.artwork_id}`);
    seen.add(item.artwork_id);
    return item;
  });
}

export function loadMapping(root) {
  return parseMapping(fs.readFileSync(path.join(root, CSV_PATH), "utf8"));
}

export function mappingMetadata(rows) {
  return {
    note: "Canonical artwork-to-slot mapping. Do NOT ask the owner to re-map. Do NOT regenerate it.",
    csv: CSV_PATH,
    md: MD_PATH,
    evidence: "docs/proofs/artwork-coverage-2026-10-14/",
    pointer: POINTER_PATH,
    placements: rows.length,
    drawingGroups: new Set(rows.map((row) => row.drawing_group_id)).size,
    engravedOnMain: "2026-10-15",
  };
}

const cell = (value) => String(value || "—").replaceAll("|", "\\|").replace(/\r?\n/g, " ");
export function renderMapping(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.drawing_group_id)) groups.set(row.drawing_group_id, row.group_status);
    else if (groups.get(row.drawing_group_id) !== row.group_status) throw new Error(`Conflicting group status: ${row.drawing_group_id}`);
  }
  const statuses = [...new Set(rows.map((row) => row.group_status))].sort();
  return [
    "# MASTER MAPPING — Cartilla Artwork Reconciliation", "",
    "<!-- GENERATED from MASTER-MAPPING.csv by scripts/artwork-mapping.mjs. Do not edit this view. -->", "",
    "The [CSV](MASTER-MAPPING.csv) is the sole editable artwork-to-slot record. [Authority and approval rules](../../ARTWORK_MAPPING_CANONICAL.md).", "",
    "These classifications and candidate paths are historical availability evidence from October 14, 2026. They do not establish latest owner approval, current installed files, or correct runtime display. READY never means owner-approved. Original source links remain historical provenance; they do not select production artwork.", "",
    "## Totals generated from the master", "",
    "| Historical classification | Drawing groups | Placements |", "|---|---:|---:|",
    ...statuses.map((status) => `| ${status} | ${[...groups.values()].filter((value) => value === status).length} | ${rows.filter((row) => row.group_status === status).length} |`),
    `| **Total** | **${groups.size}** | **${rows.length}** |`, "",
    "## Every placement", "",
    "Keep stable placement IDs, including legacy PEZ filenames: DRAW-WB-10-1 depicts an airplane (avión). Blank destinations remain unresolved; never fill them by guessing. Recorded archive-member paths do not imply accessible GitHub assets.", "",
    "| Placement | Book | Page/sheet | Drawing group | Subject | Historical availability | Original source | Recorded candidate (not approval) |",
    "|---|---|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${[row.artwork_id, row.book, row.page_sheet, row.drawing_group_id, row.drawing_label, row.placement_status, row.source_crop_path, row.destination_path].map(cell).join(" | ")} |`), "",
  ].join("\n");
}

export function checkMapping(root) {
  const rows = loadMapping(root);
  const errors = [];
  if (fs.readFileSync(path.join(root, MD_PATH), "utf8") !== renderMapping(rows)) errors.push(`${MD_PATH}: stale generated view; run pnpm artwork:mapping:update`);
  for (const name of ["AGENTS.md", "PROJECT_SOURCE_OF_TRUTH.md", "README.md", "tasks/plan.md"]) {
    const text = fs.readFileSync(path.join(root, name), "utf8");
    if (!text.includes("ARTWORK_MAPPING_CANONICAL.md")) errors.push(`${name}: missing canonical artwork pointer`);
    if (/\[current master mapping\]\([^)]*evidence(?:%2F|\/)artwork-coverage/i.test(text) || /current source-evidenced artwork reconciliation[^\n]*draft evidence branch/i.test(text)) errors.push(`${name}: obsolete branch advertised as current authority`);
  }
  return { ...mappingMetadata(rows), ok: errors.length === 0, errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(import.meta.dirname, "..");
  if (process.argv.includes("--write")) fs.writeFileSync(path.join(root, MD_PATH), renderMapping(loadMapping(root)));
  const result = checkMapping(root);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
