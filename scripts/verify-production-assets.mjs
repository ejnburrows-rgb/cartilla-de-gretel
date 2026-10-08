import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const read = (name) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
  } catch (err) {
    return {};
  }
};
const strings = (value) =>
  typeof value === "string"
    ? [value]
    : value && typeof value === "object"
      ? Object.values(value).flatMap(strings)
      : [];
const refs = (name) =>
  strings(read(name)).filter((s) => /^\/cartilla\/.*\.(png|webp|jpg|svg|gif|mp4|webm)$/i.test(s));

const workbook = [...new Set(refs("src/data/page-layouts.json"))];
const flipchart = [...new Set(refs("src/data/flipchart-production-art.json"))];
const registry = read("src/data/final-backgrounds.json");
const gretel = [...new Set([...refs("src/data/gretel-approved-master.json"), ...refs("src/data/gretel-approved-clips.json")])];

const backgrounds = [
  ...Object.values(registry.workbook || {}),
  ...Object.values(registry.flipchart || {})
];

const delivery = workbook
  .filter((s) => s.startsWith("/cartilla/art/faithful/") && s.endsWith(".webp"))
  .flatMap((s) =>
    [384, 768].map((width) => s.replace("/art/faithful/", `/art/delivery/faithful/${width}/`)),
  );

const required = [
  ...new Set([...workbook, ...flipchart, ...gretel, ...delivery, ...backgrounds.map((a) => a.src)]),
];

const base = process.argv.find((arg) => arg.startsWith("--base-url="))?.slice(11);
const errors = [];
const expectedHash = new Map(backgrounds.map((a) => [a.src, a.sha256]));
let next = 0;

await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < required.length) {
      const src = required[next++];
      try {
        const local = fs.readFileSync(path.join(root, "public", src));
        let bytes = local;
        if (base) {
          const response = await fetch(new URL(src, base), { signal: AbortSignal.timeout(60000) });
          if (!response.ok)
            throw new Error(`HTTP ${response.status}: ${response.headers.get("content-type")}`);
          bytes = Buffer.from(await response.arrayBuffer());
          if (!bytes.equals(local))
            throw new Error("deployed bytes differ from verified local file");
        }

        // We only verify hash for backgrounds that define a sha256
        const hash = createHash("sha256").update(bytes).digest("hex");
        if (expectedHash.has(src) && hash !== expectedHash.get(src)) {
          throw new Error("delivered source hash differs");
        }

        // sharp() does not support MP4/WebM videos
        if (!src.match(/\.(mp4|webm)$/i)) {
          await sharp(bytes).stats();
        }
      } catch (error) {
        errors.push(`${src}: ${error.message}`);
      }
    }
  }),
);

console.log(
  JSON.stringify(
    {
      workbook: workbook.length,
      flipchart: flipchart.length,
      gretel: gretel.length,
      backgrounds: backgrounds.length,
      delivery: delivery.length,
      checked: required.length,
      location: base || "local",
      errors,
    },
    null,
    2,
  ),
);

if (errors.length) process.exitCode = 1;
