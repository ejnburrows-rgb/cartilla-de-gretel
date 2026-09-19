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

export type RemasterPresentationStatus =
  | "original-scan"
  | "cleaned-image"
  | "projection-candidate"
  | "approved-student"
  | "approved-teacher"
  | "needs-correction";

export type RemasterPresentation = {
  status: RemasterPresentationStatus;
  label: string;
  description: string;
  bestPath?: string;
  bestSource: "original" | "cleaned" | "projection";
};

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
  if (asset.cleanupStatus === "cleaned" || asset.cleanupStatus === "needs review")
    return publicAsset(asset.remasteredPathV2 ?? asset.remasteredPath);

  return publicAsset(originalPath);
}

export function getRemasterPresentation(asset?: RemasterAsset | null): RemasterPresentation {
  if (!asset) {
    return {
      status: "original-scan",
      label: "Original scan",
      description: "No remaster record is connected; use the source scan.",
      bestSource: "original",
    };
  }

  if (asset.approvedForStudent) {
    return {
      status: "approved-student",
      label: "Approved for student",
      description: "Inventory marks this image approved for student-facing use.",
      bestPath: publicAsset(asset.remasteredPathV2 ?? asset.remasteredPath),
      bestSource: asset.remasteredPathV2 ? "projection" : "cleaned",
    };
  }

  if (asset.approvedForTeacher) {
    return {
      status: "approved-teacher",
      label: "Approved for teacher",
      description: "Inventory marks this image approved for teacher projection use.",
      bestPath: publicAsset(asset.remasteredPathV2 ?? asset.remasteredPath),
      bestSource: asset.remasteredPathV2 ? "projection" : "cleaned",
    };
  }

  if (asset.approvalStatus === "rejected") {
    return {
      status: "needs-correction",
      label: "Needs correction",
      description:
        "Inventory marks the remaster rejected; keep the source scan visible for reference.",
      bestPath: publicAsset(asset.originalSourcePath),
      bestSource: "original",
    };
  }

  if (asset.remasteredPathV2 || asset.cleanupStatus === "needs review") {
    return {
      status: "projection-candidate",
      label: "Projection candidate",
      description: "Candidate image is ready for visual review, not approved.",
      bestPath: publicAsset(asset.remasteredPathV2 ?? asset.remasteredPath),
      bestSource: asset.remasteredPathV2 ? "projection" : "cleaned",
    };
  }

  if (
    asset.cleanupStatus === "cleaned" ||
    asset.cleanupStatus === "approved" ||
    asset.approvalStatus === "approved"
  ) {
    return {
      status: "cleaned-image",
      label: "Cleaned image",
      description:
        "Basic cleaned image is available, but student/teacher approval must come from inventory flags.",
      bestPath: publicAsset(asset.remasteredPath),
      bestSource: "cleaned",
    };
  }

  return {
    status: "original-scan",
    label: "Original scan",
    description: "Only the raw source scan is available in the inventory.",
    bestPath: publicAsset(asset.originalSourcePath),
    bestSource: "original",
  };
}

export function getQualityLabel(originalPath?: string | null, mode: QualityMode = "projection") {
  const asset = getRemasterAssetByOriginal(originalPath);
  if (!asset || mode === "source") return "Original scan";
  const presentation = getRemasterPresentation(asset);
  if (mode === "projection") return presentation.label;
  if (asset.cleanupStatus === "cleaned" || asset.approvalStatus === "approved")
    return "Cleaned image";
  return "Original scan";
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
