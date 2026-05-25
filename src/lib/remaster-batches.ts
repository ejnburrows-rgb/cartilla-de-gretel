import remasterInventory from "@/data/remaster-inventory.json";
import { getRemasterPresentation, type RemasterAsset } from "@/lib/remaster-assets";

export type RemasterBatchItem = RemasterAsset & {
  priority: "review-now" | "student-next" | "teacher-next" | "correction-needed";
  label: string;
};

const assets = remasterInventory.assets as RemasterAsset[];

export function getDeadlineRemasterQueue(limit = 12): RemasterBatchItem[] {
  const reviewable = assets
    .filter((asset) => asset.remasteredPathV2 || asset.cleanupStatus === "needs review" || asset.cleanupStatus === "cleaned")
    .map((asset) => ({
      ...asset,
      priority: asset.approvalStatus === "rejected" ? "correction-needed" as const : "review-now" as const,
      label: getRemasterPresentation(asset).label,
    }));

  const studentNext = assets
    .filter((asset) => asset.type === "student-workbook" && asset.cleanupStatus === "pending")
    .slice(0, Math.max(0, limit - reviewable.length))
    .map((asset) => ({
      ...asset,
      priority: "student-next" as const,
      label: "Student image pending",
    }));

  const teacherNext = assets
    .filter((asset) => asset.type === "teacher-flipchart" && asset.cleanupStatus === "pending")
    .slice(0, Math.max(0, limit - reviewable.length - studentNext.length))
    .map((asset) => ({
      ...asset,
      priority: "teacher-next" as const,
      label: "Teacher image pending",
    }));

  return [...reviewable, ...studentNext, ...teacherNext].slice(0, limit);
}

export function getDeadlineRemasterSummary() {
  const total = assets.length;
  const usableNow = assets.filter(
    (asset) => asset.remasteredPathV2 || asset.cleanupStatus === "needs review" || asset.cleanupStatus === "cleaned" || asset.approvalStatus === "approved",
  ).length;
  const approvedStudent = assets.filter((asset) => asset.approvedForStudent).length;
  const approvedTeacher = assets.filter((asset) => asset.approvedForTeacher).length;
  const needsCorrection = assets.filter((asset) => asset.approvalStatus === "rejected").length;
  const studentPending = assets.filter((asset) => asset.type === "student-workbook" && asset.cleanupStatus === "pending").length;
  const teacherPending = assets.filter((asset) => asset.type === "teacher-flipchart" && asset.cleanupStatus === "pending").length;
  const v2 = assets.filter((asset) => Boolean(asset.remasteredPathV2)).length;

  return { total, usableNow, approvedStudent, approvedTeacher, needsCorrection, studentPending, teacherPending, v2 };
}
