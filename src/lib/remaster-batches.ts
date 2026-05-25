import remasterInventory from "@/data/remaster-inventory.json";
import type { RemasterAsset } from "@/lib/remaster-assets";

export type RemasterBatchItem = RemasterAsset & {
  priority: "ship-now" | "student-next" | "teacher-next";
  label: string;
};

const assets = remasterInventory.assets as RemasterAsset[];

export function getDeadlineRemasterQueue(limit = 12): RemasterBatchItem[] {
  const reviewable = assets
    .filter((asset) => asset.remasteredPathV2 || asset.cleanupStatus === "needs review" || asset.cleanupStatus === "cleaned")
    .map((asset) => ({
      ...asset,
      priority: "ship-now" as const,
      label: asset.remasteredPathV2 ? "V2 listo para usar" : "Corregido listo para revisar",
    }));

  const studentNext = assets
    .filter((asset) => asset.type === "student-workbook" && asset.cleanupStatus === "pending")
    .slice(0, Math.max(0, limit - reviewable.length))
    .map((asset) => ({
      ...asset,
      priority: "student-next" as const,
      label: "Siguiente cuaderno",
    }));

  const teacherNext = assets
    .filter((asset) => asset.type === "teacher-flipchart" && asset.cleanupStatus === "pending")
    .slice(0, Math.max(0, limit - reviewable.length - studentNext.length))
    .map((asset) => ({
      ...asset,
      priority: "teacher-next" as const,
      label: "Siguiente flipchart",
    }));

  return [...reviewable, ...studentNext, ...teacherNext].slice(0, limit);
}

export function getDeadlineRemasterSummary() {
  const total = assets.length;
  const usableNow = assets.filter(
    (asset) => asset.remasteredPathV2 || asset.cleanupStatus === "needs review" || asset.cleanupStatus === "cleaned" || asset.approvalStatus === "approved",
  ).length;
  const studentPending = assets.filter((asset) => asset.type === "student-workbook" && asset.cleanupStatus === "pending").length;
  const teacherPending = assets.filter((asset) => asset.type === "teacher-flipchart" && asset.cleanupStatus === "pending").length;
  const v2 = assets.filter((asset) => Boolean(asset.remasteredPathV2)).length;

  return { total, usableNow, studentPending, teacherPending, v2 };
}
