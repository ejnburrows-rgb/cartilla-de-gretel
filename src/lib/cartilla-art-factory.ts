export const ART_FACTORY_STORAGE_KEY = "cartilla-art-factory:v1";

export const ART_FACTORY_STATUSES = [
  "NOT STARTED",
  "READY",
  "GENERATED",
  "NEEDS FIX",
  "READY FOR INTEGRATION",
  "INTEGRATED",
  "EXPORTED",
] as const;

export type ArtFactoryStatus = (typeof ART_FACTORY_STATUSES)[number];

export const ART_FACTORY_CATEGORIES = [
  "human",
  "animal",
  "object",
  "complex scene",
  "decorative element",
  "Gretel",
  "other",
] as const;

export type ArtFactoryCategory = (typeof ART_FACTORY_CATEGORIES)[number];

export type NormalizedCrop = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
};

export type StyleReference = {
  id: string;
  name: string;
  dataUrl: string;
};

export type GeneratedResult = {
  name: string;
  dataUrl: string;
  importedAt: string;
};

export type ArtFactoryAsset = {
  id: string;
  studentPage: number;
  referencePages: number[];
  sourceCrop: NormalizedCrop;
  referenceCrops: NormalizedCrop[];
  category: ArtFactoryCategory;
  subject: string;
  preservationNotes: string;
  expectedFilename: string;
  prompt: string;
  status: ArtFactoryStatus;
  generatedResult?: GeneratedResult;
  qualityNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SourceDocumentMeta = {
  name: string | null;
  pageCount: number;
};

export type ArtFactoryProject = {
  version: 1;
  updatedAt: string;
  workbook: SourceDocumentMeta;
  flipchart: SourceDocumentMeta;
  mappings: Record<string, number[]>;
  styleReferences: StyleReference[];
  assets: ArtFactoryAsset[];
};

export function createEmptyArtFactoryProject(): ArtFactoryProject {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    workbook: { name: null, pageCount: 0 },
    flipchart: { name: null, pageCount: 0 },
    mappings: {},
    styleReferences: [],
    assets: [],
  };
}

export function normalizeMappingPages(pages: number[], maxPage = Number.MAX_SAFE_INTEGER) {
  return [...new Set(pages)]
    .filter((page) => Number.isInteger(page) && page >= 1 && page <= maxPage)
    .sort((a, b) => a - b);
}

export function setPageMapping(
  project: ArtFactoryProject,
  studentPage: number,
  referencePages: number[],
): ArtFactoryProject {
  const mappings = {
    ...project.mappings,
    [String(studentPage)]: normalizeMappingPages(
      referencePages,
      project.flipchart.pageCount || Number.MAX_SAFE_INTEGER,
    ),
  };
  return { ...project, mappings, updatedAt: new Date().toISOString() };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function nextAssetId(project: ArtFactoryProject, studentPage: number) {
  const prefix = `caf-p${String(studentPage).padStart(3, "0")}`;
  const used = project.assets.filter((asset) => asset.id.startsWith(prefix)).length + 1;
  return `${prefix}-a${String(used).padStart(2, "0")}`;
}

export function expectedOutputFilename(assetId: string, subject: string) {
  const subjectSlug = slugify(subject) || "asset";
  return `${assetId}-${subjectSlug}-gretel2.png`;
}

export function buildLockedCartillaPrompt(input: {
  assetId: string;
  studentPage: number;
  referencePages: number[];
  category: ArtFactoryCategory;
  subject: string;
  preservationNotes: string;
}) {
  const references =
    input.referencePages.length > 0
      ? input.referencePages.join(", ")
      : "none mapped; preserve the workbook source without inventing colors";
  const notes = input.preservationNotes.trim() || "Preserve every defining source detail.";

  return [
    `CARTILLA ART FACTORY JOB ${input.assetId}`,
    `Workbook page: ${input.studentPage}.`,
    `Mapped Flip Chart reference pages: ${references}.`,
    `Subject/category: ${input.subject || "unnamed subject"} / ${input.category}.`,
    "",
    "Re-render this exact source illustration as premium Gretel 2.0 / La Cartilla digital storybook art.",
    "Do not merely colorize, upscale, trace, clean, or redraw the old scan as the final treatment.",
    "Preserve educational identity, subject count, defining pose/action, silhouette, proportions, face/expression, major clothing, props, patterns, composition, and instructional meaning.",
    "When an exact mapped Flip Chart counterpart exists, use its established colors and visual identity as the authoritative reference.",
    "Use a handcrafted dimensional children's storybook finish with warm country/tole DNA, polished digital edges, warm brown/sienna outlines, consistent materials and lighting, and screen-ready resolution.",
    "No photorealism. No unrelated flowers, borders, text, scenery, characters, props, or decorative inventions.",
    "Do not crop meaningful content and do not stretch anatomy or objects.",
    `Preservation notes: ${notes}`,
    "",
    "Execution rule: quality validation is part of the production workflow, but there is no Emilio approval gate. Continue through integration-ready output unless an objective fidelity defect is found.",
  ].join("\n");
}

export function createAsset(
  project: ArtFactoryProject,
  input: {
    studentPage: number;
    sourceCrop: NormalizedCrop;
    referenceCrops?: NormalizedCrop[];
    category: ArtFactoryCategory;
    subject: string;
    preservationNotes: string;
  },
): ArtFactoryAsset {
  const id = nextAssetId(project, input.studentPage);
  const referencePages = normalizeMappingPages(
    project.mappings[String(input.studentPage)] ?? [],
    project.flipchart.pageCount || Number.MAX_SAFE_INTEGER,
  );
  const expectedFilename = expectedOutputFilename(id, input.subject);
  const now = new Date().toISOString();
  return {
    id,
    studentPage: input.studentPage,
    referencePages,
    sourceCrop: input.sourceCrop,
    referenceCrops: input.referenceCrops ?? [],
    category: input.category,
    subject: input.subject.trim(),
    preservationNotes: input.preservationNotes.trim(),
    expectedFilename,
    prompt: buildLockedCartillaPrompt({
      assetId: id,
      studentPage: input.studentPage,
      referencePages,
      category: input.category,
      subject: input.subject.trim(),
      preservationNotes: input.preservationNotes.trim(),
    }),
    status: "READY",
    createdAt: now,
    updatedAt: now,
  };
}

export function setAssetStatus(
  asset: ArtFactoryAsset,
  status: ArtFactoryStatus,
  qualityNotes?: string,
): ArtFactoryAsset {
  return {
    ...asset,
    status,
    qualityNotes: qualityNotes ?? asset.qualityNotes,
    updatedAt: new Date().toISOString(),
  };
}

export function matchGeneratedFilename(name: string, assets: ArtFactoryAsset[]) {
  const lowered = name.toLowerCase();
  return (
    assets.find((asset) => lowered === asset.expectedFilename.toLowerCase()) ??
    assets.find((asset) => lowered.includes(asset.id.toLowerCase())) ??
    null
  );
}

export function attachGeneratedResult(
  asset: ArtFactoryAsset,
  generatedResult: GeneratedResult,
): ArtFactoryAsset {
  return {
    ...asset,
    generatedResult,
    status: "GENERATED",
    updatedAt: new Date().toISOString(),
  };
}

export function projectForExport(project: ArtFactoryProject): ArtFactoryProject {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    styleReferences: project.styleReferences.map((ref) => ({ ...ref })),
    assets: project.assets.map((asset) => ({ ...asset })),
  };
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildArtFactoryCsv(project: ArtFactoryProject) {
  const header = [
    "asset_id",
    "student_page",
    "reference_pages",
    "category",
    "subject",
    "status",
    "expected_filename",
    "preservation_notes",
  ];
  const rows = project.assets.map((asset) => [
    asset.id,
    asset.studentPage,
    asset.referencePages.join("|"),
    asset.category,
    asset.subject,
    asset.status,
    asset.expectedFilename,
    asset.preservationNotes,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function dataUrlBytes(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return new Uint8Array();
  const meta = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (meta.includes(";base64")) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new TextEncoder().encode(decodeURIComponent(payload));
}

function concatBytes(parts: Uint8Array[]) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function little16(value: number) {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function little32(value: number) {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

type ZipEntry = { name: string; bytes: Uint8Array };

function buildStoreZip(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.bytes);
    const size = entry.bytes.length;
    const local = concatBytes([
      little32(0x04034b50),
      little16(20),
      little16(0x0800),
      little16(0),
      little16(0),
      little16(0),
      little32(crc),
      little32(size),
      little32(size),
      little16(name.length),
      little16(0),
      name,
      entry.bytes,
    ]);
    localParts.push(local);

    centralParts.push(
      concatBytes([
        little32(0x02014b50),
        little16(20),
        little16(20),
        little16(0x0800),
        little16(0),
        little16(0),
        little16(0),
        little32(crc),
        little32(size),
        little32(size),
        little16(name.length),
        little16(0),
        little16(0),
        little16(0),
        little16(0),
        little32(0),
        little32(offset),
        name,
      ]),
    );
    offset += local.length;
  }

  const central = concatBytes(centralParts);
  const end = concatBytes([
    little32(0x06054b50),
    little16(0),
    little16(0),
    little16(entries.length),
    little16(entries.length),
    little32(central.length),
    little32(offset),
    little16(0),
  ]);
  return concatBytes([...localParts, central, end]);
}

function jsonBytes(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value, null, 2) + "\n");
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

export function buildGenerationPackage(project: ArtFactoryProject, assetIds?: string[]) {
  const selected = assetIds?.length
    ? project.assets.filter((asset) => assetIds.includes(asset.id))
    : project.assets;
  const exportedProject = {
    ...projectForExport(project),
    assets: selected,
  };
  const entries: ZipEntry[] = [
    { name: "manifest.json", bytes: jsonBytes(exportedProject) },
    { name: "summary.csv", bytes: textBytes(buildArtFactoryCsv(exportedProject)) },
  ];

  for (const style of project.styleReferences) {
    entries.push({
      name: `style-references/${style.id}-${slugify(style.name) || "style"}.png`,
      bytes: dataUrlBytes(style.dataUrl),
    });
  }

  for (const asset of selected) {
    entries.push({ name: `jobs/${asset.id}.json`, bytes: jsonBytes(asset) });
    entries.push({ name: `prompts/${asset.id}.txt`, bytes: textBytes(asset.prompt) });
    entries.push({ name: `source-crops/${asset.id}.png`, bytes: dataUrlBytes(asset.sourceCrop.dataUrl) });
    asset.referenceCrops.forEach((crop, index) => {
      entries.push({
        name: `reference-crops/${asset.id}-ref-${String(index + 1).padStart(2, "0")}.png`,
        bytes: dataUrlBytes(crop.dataUrl),
      });
    });
    if (asset.generatedResult) {
      entries.push({
        name: `generated/${asset.generatedResult.name}`,
        bytes: dataUrlBytes(asset.generatedResult.dataUrl),
      });
    }
  }

  const zipBytes = buildStoreZip(entries);\n  const zipBuffer = zipBytes.buffer.slice(zipBytes.byteOffset, zipBytes.byteOffset + zipBytes.byteLength) as ArrayBuffer;\n  return new Blob([zipBuffer], { type: "application/zip" });
}

export function serializeProject(project: ArtFactoryProject) {
  return JSON.stringify(projectForExport(project));
}

export function parseProject(raw: string): ArtFactoryProject {
  const parsed = JSON.parse(raw) as Partial<ArtFactoryProject>;
  if (parsed.version !== 1 || !Array.isArray(parsed.assets) || !parsed.mappings) {
    throw new Error("Unsupported Cartilla Art Factory manifest.");
  }
  return {
    ...createEmptyArtFactoryProject(),
    ...parsed,
    version: 1,
    workbook: parsed.workbook ?? { name: null, pageCount: 0 },
    flipchart: parsed.flipchart ?? { name: null, pageCount: 0 },
    mappings: parsed.mappings ?? {},
    styleReferences: parsed.styleReferences ?? [],
    assets: parsed.assets ?? [],
    updatedAt: new Date().toISOString(),
  };
}
