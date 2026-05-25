import remasterInventory from "@/data/remaster-inventory.json";
import { assetPath } from "@/lib/assets";

export type RemasterAsset = {
  originalSourcePath: string;
  remasteredPath: string;
  remasteredPathV2?: string;
  cleanupStatus: "pending" | "cleaned" | "needs review" | "approved" | "original only";
  artifactFixed: boolean;
  remasterType: string;
  approvalStatus: "approved" | "rejected" | "pending";
  type: "student-workbook" | "teacher-flipchart";
  remasterVersion?: string;
  artifactLineFixAttempted?: boolean;
  approvedForStudent?: boolean;
  approvedForTeacher?: boolean;
  notes?: string;
};

export type QualityMode = "source" | "enhanced" | "projection";

const assets = remasterInventory.assets as RemasterAsset[];

function publicAsset(path?: string | null) {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return assetPath(path);
}

export function getRemasterAssetByOriginal(path?: string | null) {
  if (!path) return undefined;
  return assets.find((asset) => asset.originalSourcePath === path);
}

export function getBestDisplayPath(originalPath?: string | null, mode: QualityMode = "projection") {
  if (!originalPath) return undefined;
  if (mode === "source") return publicAsset(originalPath);

  const asset = getRemasterAssetByOriginal(originalPath);
  if (!asset) return publicAsset(originalPath);

  if (mode === "projection" && asset.remasteredPathV2) return publicAsset(asset.remasteredPathV2);
  if (asset.approvalStatus === "approved") return publicAsset(asset.remasteredPath);
  if (asset.cleanupStatus === "cleaned" || asset.cleanupStatus === "needs review") return publicAsset(asset.remasteredPathV2 ?? asset.remasteredPath);

  return publicAsset(originalPath);
}

export function getQualityLabel(originalPath?: string | null, mode: QualityMode = "projection") {
  const asset = getRemasterAssetByOriginal(originalPath);
  if (!asset || mode === "source") return "Escaneo original";
  if (mode === "projection" && asset.remasteredPathV2) return "V2 proyección";
  if (asset.cleanupStatus === "cleaned" || asset.approvalStatus === "approved") return "Imagen corregida";
  return "Escaneo conectado";
}

export function getRemasterProgress() {
  const total = assets.length;
  const student = assets.filter((asset) => asset.type === "student-workbook").length;
  const teacher = assets.filter((asset) => asset.type === "teacher-flipchart").length;
  const corrected = assets.filter(
    (asset) =>
      asset.cleanupStatus === "cleaned" ||
      asset.cleanupStatus === "needs review" ||
      asset.cleanupStatus === "approved" ||
      Boolean(asset.remasteredPathV2),
  ).length;
  const v2 = assets.filter((asset) => Boolean(asset.remasteredPathV2)).length;
  const pending = assets.filter((asset) => asset.cleanupStatus === "pending").length;

  return { total, student, teacher, corrected, v2, pending };
}
