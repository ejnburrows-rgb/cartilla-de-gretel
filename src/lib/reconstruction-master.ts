import manifestData from "@/data/reconstruction/production-manifest.json";

type NormBox = { x: number; y: number; width: number; height: number };

type ReconstructionPlacement = {
  id: string;
  strategy: "EXACT_COLORED_COUNTERPART" | "COLOR_TRANSFER_REQUIRED";
  workbook_box_norm: NormBox;
  flipchart_pdf_page: number;
  flipchart_source_file: string;
  flipchart_source_sha256: string;
  flipchart_box_norm?: NormBox | null;
  geometry_checks?: Record<string, boolean> | null;
  mapping_verified: boolean;
  verified_colorized_asset?: string | null;
  verified_colorized_asset_sha256?: string | null;
  color_transfer_verification?: string | null;
};

export type ReconstructedMasterAsset = {
  printed_page: number;
  workbook_pdf_sheet: number;
  workbook_source_file: string;
  workbook_source_sha256: string;
  output_path: string;
  output_sha256: string;
  verification_status: "PASS";
  placements: ReconstructionPlacement[];
};

const GEOMETRY_KEYS = [
  "subject_identity",
  "subject_count",
  "pose_action",
  "anatomy",
  "silhouette",
  "proportions",
  "face_expression",
  "linework",
  "props",
  "orientation",
  "composition",
  "educational_meaning",
] as const;

const SHA256 = /^[a-f0-9]{64}$/i;

function validBox(box: unknown): box is NormBox {
  if (!box || typeof box !== "object") return false;
  const b = box as Record<string, unknown>;
  const values = ["x", "y", "width", "height"].map((k) => b[k]);
  if (!values.every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1)) {
    return false;
  }
  const [x, y, width, height] = values as number[];
  return width > 0 && height > 0 && x + width <= 1.000001 && y + height <= 1.000001;
}

function validPlacement(value: unknown): value is ReconstructionPlacement {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  if (typeof p.id !== "string" || !p.id) return false;
  if (!validBox(p.workbook_box_norm)) return false;
  if (p.mapping_verified !== true) return false;
  if (
    typeof p.flipchart_pdf_page !== "number" ||
    !Number.isInteger(p.flipchart_pdf_page) ||
    p.flipchart_pdf_page < 1 ||
    p.flipchart_pdf_page > 62
  ) {
    return false;
  }
  if (typeof p.flipchart_source_file !== "string" || !p.flipchart_source_file) return false;
  if (typeof p.flipchart_source_sha256 !== "string" || !SHA256.test(p.flipchart_source_sha256)) return false;

  if (p.strategy === "EXACT_COLORED_COUNTERPART") {
    if (!validBox(p.flipchart_box_norm)) return false;
    const checks = p.geometry_checks as Record<string, unknown> | undefined;
    return GEOMETRY_KEYS.every((key) => checks?.[key] === true);
  }

  if (p.strategy === "COLOR_TRANSFER_REQUIRED") {
    return (
      typeof p.verified_colorized_asset === "string" &&
      Boolean(p.verified_colorized_asset) &&
      typeof p.verified_colorized_asset_sha256 === "string" &&
      SHA256.test(p.verified_colorized_asset_sha256) &&
      p.color_transfer_verification === "PASS"
    );
  }

  return false;
}

export function hasFullReconstructionProvenance(value: unknown): value is ReconstructedMasterAsset {
  if (!value || typeof value !== "object") return false;
  const asset = value as Record<string, unknown>;
  return (
    typeof asset.printed_page === "number" &&
    Number.isInteger(asset.printed_page) &&
    asset.printed_page >= 1 &&
    asset.printed_page <= 90 &&
    typeof asset.workbook_pdf_sheet === "number" &&
    Number.isInteger(asset.workbook_pdf_sheet) &&
    asset.workbook_pdf_sheet >= 1 &&
    asset.workbook_pdf_sheet <= 98 &&
    typeof asset.workbook_source_file === "string" &&
    Boolean(asset.workbook_source_file) &&
    typeof asset.workbook_source_sha256 === "string" &&
    SHA256.test(asset.workbook_source_sha256) &&
    typeof asset.output_path === "string" &&
    /^\/cartilla\/art\/reconstructed\/workbook\/page-\d{3}\.png$/.test(asset.output_path) &&
    typeof asset.output_sha256 === "string" &&
    SHA256.test(asset.output_sha256) &&
    asset.verification_status === "PASS" &&
    Array.isArray(asset.placements) &&
    asset.placements.length > 0 &&
    asset.placements.every(validPlacement)
  );
}

const manifest = manifestData as unknown as { assets?: unknown[] };

export function getReconstructedMasterAsset(pageNumber: number): ReconstructedMasterAsset | null {
  const candidate = (manifest.assets ?? []).find(
    (asset) =>
      asset &&
      typeof asset === "object" &&
      (asset as Record<string, unknown>).printed_page === pageNumber,
  );
  return hasFullReconstructionProvenance(candidate) ? candidate : null;
}
