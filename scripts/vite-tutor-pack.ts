/** Build-owned manifest includes every emitted chunk, including lazy imports,
 *  plus modular per-lesson, avatar, Vosk, and optional Tier-3 pack descriptors. */
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const hash = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");

function pictureModels(): Record<string, { sourceSha256: string }> {
  return JSON.parse(readFileSync("src/content/tutor-picture-models.json", "utf8"));
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
  );
}

function padLesson(lesson: number): string {
  return String(lesson).padStart(2, "0");
}

function isQuarantinedAsset(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("nina-sordita") ||
    lower.includes("rec_gretel_") ||
    lower.includes("gretel_67_audio") ||
    lower.includes("tinywow")
  );
}

interface PackAssetEntry {
  url: string;
  bytes: number;
  sha256: string;
}

interface LessonPackManifest {
  id: string;
  lesson: number;
  dialogueManifestUrl: string;
  files: PackAssetEntry[];
  totalBytes: number;
  hasApprovedAudio: boolean;
}

interface Tier3SlotManifest {
  id: string;
  label: string;
  optInOnly: true;
  available: boolean;
  estimatedBytes: number;
  files: PackAssetEntry[];
}

export interface TutorAssetsManifest {
  buildId: string;
  packVersion: string;
  files: PackAssetEntry[];
  packs: {
    universal: {
      id: "universal";
      files: PackAssetEntry[];
      totalBytes: number;
    };
    avatar: {
      id: "avatar";
      files: PackAssetEntry[];
      totalBytes: number;
    };
    vosk: {
      id: "vosk";
      files: PackAssetEntry[];
      totalBytes: number;
    };
    lessons: Record<string, LessonPackManifest>;
    tier3: Tier3SlotManifest[];
  };
}

const TUTOR_PACK_VERSION = "v1.1.0";
const classroomAssets = ["listening.webp", "conversation.webp", "speech.webp", "abeja.webm"].map(
  (file) => "/cartilla/images/gretel/tutor/classroom-review/" + file,
);

const ALL_LESSONS = Array.from({ length: 24 }, (_, idx) => idx + 1);

// Includes dirty source contents, so proofs/builds cannot borrow an older identity.
export function tutorBuildId(): string {
  const files = [
    ...sourceFiles("src").filter(
      (file) => !file.includes("__tests__") && !file.includes("src/test/"),
    ),
    "public/sw.js",
    "pnpm-lock.yaml",
    "scripts/fetch-vosk-model.mjs",
    "scripts/vite-tutor-pack.ts",
    "vite.config.ts",
  ];
  const lines = JSON.parse(readFileSync("src/content/tutor-lines.json", "utf8"));
  files.push(
    ...classroomAssets.map((url) => "public" + url),
    "public/cartilla/images/gretel/gretel-approved-master.png",
    "public/cartilla/images/gretel/layers/manifest.json",
  );
  for (const entry of lines.approved) {
    if (entry.src) files.push(`public${entry.src}`);
    if (entry.visemes) files.push(`public${entry.visemes}`);
  }
  files.push(...Object.keys(pictureModels()).map((url) => `public${url}`));
  return hash(
    files
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `${file}:${hash(readFileSync(file))}`)
      .join("\n"),
  );
}

export function tutorPackPlugin(buildId: string): Plugin {
  return {
    name: "tutor-verified-pack",
    apply: "build",
    async buildStart() {
      if (process.env.VITE_TUTOR_EARS === "stub")
        throw new Error("StubEars is test-only; refusing a production build.");
      // No shell interpolation; fixed script and pinned official model only.
      await promisify(execFile)(process.execPath, ["scripts/fetch-vosk-model.mjs"], {
        timeout: 180_000,
      });
    },
    writeBundle(outputOptions, bundle) {
      const outDir = outputOptions.dir ?? "dist";
      const fileMap = new Map<string, PackAssetEntry>();
      const add = (url: string, bytes: Uint8Array): PackAssetEntry => {
        if (
          !url.startsWith("/") ||
          url.includes("..") ||
          url.includes("\\") ||
          url.startsWith("//")
        ) {
          throw new Error(`Invalid tutor asset path: ${url}`);
        }
        if (isQuarantinedAsset(url)) {
          throw new Error(`Refusing quarantined audio asset in tutor pack: ${url}`);
        }
        const existing = fileMap.get(url);
        if (existing) return existing;
        const entry: PackAssetEntry = {
          url,
          bytes: bytes.byteLength,
          sha256: hash(bytes),
        };
        fileMap.set(url, entry);
        return entry;
      };

      const universalFiles: PackAssetEntry[] = [];
      const avatarFiles: PackAssetEntry[] = [];
      const voskFiles: PackAssetEntry[] = [];

      // 1. All emitted JS/CSS/asset chunks belong to the universal shell pack.
      for (const name of Object.keys(bundle)) {
        if (/\.(?:gz|br|map|html)$/.test(name)) continue;
        // Vite may finalize CSS after generateBundle; hash the actual shipped bytes.
        const asset = add(`/${name}`, readFileSync(path.join(outDir, name)));
        universalFiles.push(asset);
      }

      // 2. Vosk Spanish offline STT model pack.
      const voskUrl = "/models/vosk/vosk-model-small-es-0.42.bin";
      voskFiles.push(add(voskUrl, readFileSync(`public${voskUrl}`)));

      // 3. Avatar layer pack (master + manifest + any approved layers).
      const avatarUrls = new Set<string>([
        ...classroomAssets,
        "/cartilla/images/gretel/gretel-approved-master.png",
        "/cartilla/images/gretel/layers/manifest.json",
      ]);
      const layers = JSON.parse(
        readFileSync("public/cartilla/images/gretel/layers/manifest.json", "utf8"),
      );
      for (const layer of layers.layers ?? []) {
        if (layer.approval && layer.src) avatarUrls.add(layer.src);
      }
      for (const url of [...avatarUrls].sort((a, b) => a.localeCompare(b))) {
        avatarFiles.push(add(url, readFileSync(`public${url}`)));
      }

      // 4. Emit lazy-loadable dialogue manifests under dist/tutor-dialogue/*.json
      const dialogueOutDir = path.join(outDir, "tutor-dialogue");
      mkdirSync(dialogueOutDir, { recursive: true });
      const universalDialogueSrc = path.join("src/content/tutor-dialogue", "universal.json");
      if (existsSync(universalDialogueSrc)) {
        const bytes = readFileSync(universalDialogueSrc);
        writeFileSync(path.join(dialogueOutDir, "universal.json"), bytes);
        universalFiles.push(add("/tutor-dialogue/universal.json", bytes));
      }

      // 5. Legacy approved lines grouped by lesson (0 = universal, 1..24 = per-lesson)
      const lines = JSON.parse(readFileSync("src/content/tutor-lines.json", "utf8")) as {
        approved: Array<{ lesson: number; src?: string; visemes?: string }>;
      };
      const lessonAssetUrls = new Map<number, Set<string>>();
      for (const lesson of ALL_LESSONS) lessonAssetUrls.set(lesson, new Set<string>());

      const legacyByAudio = new Map<string, string[]>();
      for (const entry of lines.approved) {
        const targetLesson = Number(entry.lesson) || 0;
        const urls = [entry.src, entry.visemes].filter(
          (value): value is string => typeof value === "string" && value.length > 0,
        );
        if (entry.src) legacyByAudio.set(entry.src, urls);
        for (const url of urls) {
          const packed = add(url, readFileSync(`public${url}`));
          if (targetLesson === 0) {
            universalFiles.push(packed);
          } else {
            lessonAssetUrls.get(targetLesson)?.add(url);
          }
        }
      }
      const pictures = pictureModels();

      // 6. Per-lesson packs (Lessons 1–24) including lazy dialogue manifest + approved audio/visemes
      const lessonsManifest: Record<string, LessonPackManifest> = {};
      for (const lesson of ALL_LESSONS) {
        const lessonFileName = `lesson-${padLesson(lesson)}.json`;
        const dialogueSrcPath = path.join("src/content/tutor-dialogue", lessonFileName);
        const dialogueUrl = `/tutor-dialogue/${lessonFileName}`;
        const perLessonEntries = new Map<string, PackAssetEntry>();
        let hasApprovedAudio = false;
        const graph: { items: Array<{ approvedAudioSrc?: string | null }> } = JSON.parse(
          readFileSync(`src/content/tutor-graph/lesson-${padLesson(lesson)}.json`, "utf8"),
        );
        for (const { approvedAudioSrc: src } of graph.items) {
          if (!src) continue;
          const picture = pictures[src];
          if (picture) {
            const bytes = readFileSync(`public${src}`);
            if (hash(bytes) !== picture.sourceSha256) throw new Error(`Stale Tutor mouth cues: ${src}`);
            perLessonEntries.set(src, add(src, bytes));
            hasApprovedAudio = true;
          }
          for (const url of legacyByAudio.get(src) ?? []) lessonAssetUrls.get(lesson)?.add(url);
        }

        if (existsSync(dialogueSrcPath)) {
          const dialogueBytes = readFileSync(dialogueSrcPath);
          writeFileSync(path.join(dialogueOutDir, lessonFileName), dialogueBytes);
          const packedDialogue = add(dialogueUrl, dialogueBytes);
          perLessonEntries.set(dialogueUrl, packedDialogue);

          // Also include any approved audio/visemes referenced in the v2 lesson manifest.
          const parsed = JSON.parse(dialogueBytes.toString("utf8")) as {
            entries?: Array<{
              status?: string;
              audio?: { src?: string | null; visemes?: string | null };
            }>;
          };
          for (const item of parsed.entries ?? []) {
            if (item.status !== "approved") continue;
            for (const candidate of [item.audio?.src, item.audio?.visemes]) {
              if (
                typeof candidate === "string" &&
                candidate.startsWith("/") &&
                !isQuarantinedAsset(candidate) &&
                existsSync(`public${candidate}`)
              ) {
                lessonAssetUrls.get(lesson)?.add(candidate);
              }
            }
          }
        }

        for (const url of [...(lessonAssetUrls.get(lesson) ?? [])].sort((a, b) =>
          a.localeCompare(b),
        )) {
          const packed = add(url, readFileSync(`public${url}`));
          perLessonEntries.set(url, packed);
          if (url.endsWith(".mp3") || url.endsWith(".wav") || url.endsWith(".ogg")) {
            hasApprovedAudio = true;
          }
        }

        const lessonFiles = [...perLessonEntries.values()].sort((a, b) =>
          a.url.localeCompare(b.url),
        );
        lessonsManifest[String(lesson)] = {
          id: `lesson-${lesson}`,
          lesson,
          dialogueManifestUrl: dialogueUrl,
          files: lessonFiles,
          totalBytes: lessonFiles.reduce((sum, item) => sum + item.bytes, 0),
          hasApprovedAudio,
        };
      }

      // 7. Separate optional Tier-3 pack slots (never shipped with unverified heavy models by default)
      const tier3Slots: Tier3SlotManifest[] = [
        {
          id: "tier3-vision-handwriting",
          label: "Visión local de trazos (solo captura, opcional)",
          optInOnly: true,
          available: false,
          estimatedBytes: 14_000_000,
          files: [],
        },
        {
          id: "tier3-local-llm-qa",
          label: "Modelo local de preguntas curriculares (opcional)",
          optInOnly: true,
          available: false,
          estimatedBytes: 650_000_000,
          files: [],
        },
        {
          id: "tier3-handsfree-vad",
          label: "Interrupción manos libres por voz (opcional)",
          optInOnly: true,
          available: false,
          estimatedBytes: 3_000_000,
          files: [],
        },
        {
          id: "tier3-av-recorder",
          label: "Grabación audiovisual local con consentimiento (API del navegador)",
          optInOnly: true,
          available: true,
          estimatedBytes: 0,
          files: [],
        },
      ];

      const manifest: TutorAssetsManifest = {
        buildId,
        packVersion: TUTOR_PACK_VERSION,
        files: [...fileMap.values()].sort((a, b) => a.url.localeCompare(b.url)),
        packs: {
          universal: {
            id: "universal",
            files: universalFiles.sort((a, b) => a.url.localeCompare(b.url)),
            totalBytes: universalFiles.reduce((sum, item) => sum + item.bytes, 0),
          },
          avatar: {
            id: "avatar",
            files: avatarFiles.sort((a, b) => a.url.localeCompare(b.url)),
            totalBytes: avatarFiles.reduce((sum, item) => sum + item.bytes, 0),
          },
          vosk: {
            id: "vosk",
            files: voskFiles.sort((a, b) => a.url.localeCompare(b.url)),
            totalBytes: voskFiles.reduce((sum, item) => sum + item.bytes, 0),
          },
          lessons: lessonsManifest,
          tier3: tier3Slots,
        },
      };

      writeFileSync(path.join(outDir, "tutor-assets.json"), JSON.stringify(manifest));
    },
  };
}
