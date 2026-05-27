// content/index.ts — single import path for the entire content layer.
// Lets every route + lib write `import { LESSONS, BADGES, ... } from "@/content"`.
// Keeps the content tree tidy as it grows.

export * from "./lesson-meta";
export * from "./page-bindings";
export * from "./exercise-seed";
export * from "./sentence-bank";
export * from "./picture-catalog";
export * from "./intro-content";
export * from "./gretel-feedback";
export * from "./standards-alignment";
export * from "./lesson-rubric";
export * from "./parent-letter-templates";
export * from "./teacher-tips";
export * from "./badge-catalog";
export * from "./streak-milestones";
export * from "./vowel-drag-pairs";
export * from "./reading-mode-hard";
export * from "./audio-manifest";
export * from "./family-practice-plan";
export * from "./error-messages";
export * from "./onboarding-copy";
export * from "./sticker-pack";
export * from "./print-binder-config";
export * from "./teacher-dashboard-copy";
export * from "./celebration-variants";
