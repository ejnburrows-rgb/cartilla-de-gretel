/** Build-owned manifest includes every emitted chunk, including lazy imports. */
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const hash = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
  );
}
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
    "public/cartilla/images/gretel/gretel-approved-master.png",
    "public/cartilla/images/gretel/layers/manifest.json",
  );
  for (const entry of lines.approved) {
    if (entry.src) files.push(`public${entry.src}`);
    if (entry.visemes) files.push(`public${entry.visemes}`);
  }
  return hash(
    files
      .sort()
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
      const files: { url: string; bytes: number; sha256: string }[] = [];
      const add = (url: string, bytes: Uint8Array) =>
        files.push({ url, bytes: bytes.byteLength, sha256: hash(bytes) });
      for (const name of Object.keys(bundle)) {
        if (/\.(?:gz|br|map|html)$/.test(name)) continue;
        // Vite may finalize CSS after generateBundle; hash the actual shipped bytes.
        add(`/${name}`, readFileSync(path.join(outputOptions.dir ?? "dist", name)));
      }
      const lines = JSON.parse(readFileSync("src/content/tutor-lines.json", "utf8"));
      const staticFiles = new Set<string>([
        "/models/vosk/vosk-model-small-es-0.42.bin",
        "/cartilla/images/gretel/gretel-approved-master.png",
        "/cartilla/images/gretel/layers/manifest.json",
      ]);
      for (const entry of lines.approved) {
        if (entry.src) staticFiles.add(entry.src);
        if (entry.visemes) staticFiles.add(entry.visemes);
      }
      const layers = JSON.parse(
        readFileSync("public/cartilla/images/gretel/layers/manifest.json", "utf8"),
      );
      for (const layer of layers.layers ?? [])
        if (layer.approval && layer.src) staticFiles.add(layer.src);
      for (const url of staticFiles) {
        if (
          !url.startsWith("/") ||
          url.includes("..") ||
          url.includes("\\") ||
          url.startsWith("//")
        )
          throw new Error("Invalid tutor asset path");
        add(url, readFileSync(`public${url}`));
      }
      writeFileSync(
        path.join(outputOptions.dir ?? "dist", "tutor-assets.json"),
        JSON.stringify({ buildId, files }),
      );
    },
  };
}
