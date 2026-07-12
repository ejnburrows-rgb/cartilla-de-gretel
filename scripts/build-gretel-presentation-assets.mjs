/**
 * Worker E — Gretel presentation assets
 * Source-derived only (no AI redesign). Uses owner-supplied pose cutouts + gretel-original.png.
 *
 * Outputs:
 *   public/cartilla/art/hero/gretel-hero.webp (+ @2x)
 *   public/gretel/poses/<pose>/frame-n.webp
 *   generated/gretel-hero/BEFORE|AFTER*
 *   generated/gretel-poses-manifest.json
 *   public/cartilla/art/living/gretel/* (optional living blink pair)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const POSES_SRC = path.join(root, "public/cartilla/images/gretel/poses");
const ORIGINAL = path.join(root, "public/cartilla/images/gretel/gretel-original.png");
const COVER_ORIG = path.join(root, "public/cartilla/images/original/cover.jpg");

const HERO_DIR = path.join(root, "public/cartilla/art/hero");
const LIVING_DIR = path.join(root, "public/cartilla/art/living/gretel");
const POSE_OUT = path.join(root, "public/gretel/poses");
const GEN_HERO = path.join(root, "generated/gretel-hero");
const GEN_MANIFEST = path.join(root, "generated/gretel-poses-manifest.json");

/** Canon clothing pose map — reject gretel-wave.webp (wrong white/teal outfit). */
const POSE_MAP = {
  idle: ["gretel-idle.webp", "gretel-blink.webp"],
  pointing: ["gretel-point.webp"],
  cheering: ["gretel-cheer.webp", "gretel-cheer-1.webp"],
  // Contemplative closed-mouth talk frames (source-derived; no redesign)
  thinking: ["gretel-talk-0.webp", "gretel-talk.webp"],
  waving: ["gretel-wave-1.webp", "gretel-wave-2.webp"],
};

// Blink is source-derived and visually correct (half-closed lids) — keep enabled.
const BLINK_ENABLED = true;

async function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function writeWebp(inputPath, outPath, { width, height, quality = 88 } = {}) {
  let pipeline = sharp(inputPath).ensureAlpha();
  if (width || height) {
    pipeline = pipeline.resize({
      width,
      height,
      fit: "inside",
      withoutEnlargement: false,
    });
  }
  await pipeline.webp({ quality, effort: 5 }).toFile(outPath);
  const meta = await sharp(outPath).metadata();
  return { path: outPath, width: meta.width, height: meta.height, bytes: fs.statSync(outPath).size };
}

async function main() {
  await ensureDir(HERO_DIR);
  await ensureDir(LIVING_DIR);
  await ensureDir(POSE_OUT);
  await ensureDir(GEN_HERO);

  // BEFORE: copy prior hero if any, else snapshot original cover/source as before
  const existingHero = path.join(HERO_DIR, "gretel-hero.webp");
  const beforePath = path.join(GEN_HERO, "BEFORE-gretel-hero.webp");
  if (fs.existsSync(existingHero)) {
    fs.copyFileSync(existingHero, beforePath);
  } else if (fs.existsSync(COVER_ORIG)) {
    await writeWebp(COVER_ORIG, beforePath, { width: 512, quality: 80 });
  } else {
    await writeWebp(ORIGINAL, beforePath, { width: 512, quality: 80 });
  }

  // Hero: premium full-scene Gretel (gretel-original.png) — 1x and 2x
  const hero1 = path.join(HERO_DIR, "gretel-hero.webp");
  const hero2 = path.join(HERO_DIR, "gretel-hero@2x.webp");
  const heroInfo1 = await writeWebp(ORIGINAL, hero1, { width: 640, quality: 90 });
  const heroInfo2 = await writeWebp(ORIGINAL, hero2, { width: 1280, quality: 90 });

  const after1 = path.join(GEN_HERO, "AFTER-gretel-hero.webp");
  const after2 = path.join(GEN_HERO, "AFTER-gretel-hero@2x.webp");
  fs.copyFileSync(hero1, after1);
  fs.copyFileSync(hero2, after2);

  // Transparent cutout hero companion from idle (for splash overlays)
  const heroCutout = path.join(HERO_DIR, "gretel-hero-cutout.webp");
  const cutoutInfo = await writeWebp(path.join(POSES_SRC, "gretel-idle.webp"), heroCutout, {
    width: 512,
    quality: 90,
  });

  // Living blink pair
  const livingIdle = path.join(LIVING_DIR, "idle.webp");
  const livingBlink = path.join(LIVING_DIR, "blink.webp");
  await writeWebp(path.join(POSES_SRC, "gretel-idle.webp"), livingIdle, { width: 512, quality: 90 });
  await writeWebp(path.join(POSES_SRC, "gretel-blink.webp"), livingBlink, { width: 512, quality: 90 });

  // Pose frames under public/gretel/poses/<pose>/frame-n.webp
  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceRoot: "public/cartilla/images/gretel/poses",
    hero: {
      src: "/cartilla/art/hero/gretel-hero.webp",
      src2x: "/cartilla/art/hero/gretel-hero@2x.webp",
      cutout: "/cartilla/art/hero/gretel-hero-cutout.webp",
      source: "public/cartilla/images/gretel/gretel-original.png",
      canon: {
        hair: "golden wavy blonde",
        bow: "red",
        eyes: "blue",
        blush: "pink",
        freckles: false,
        age: "5-7",
        clothing: "orange-red striped shirt + blue overall dress with flower hem",
      },
      width: heroInfo1.width,
      height: heroInfo1.height,
      width2x: heroInfo2.width,
      height2x: heroInfo2.height,
      cutoutBytes: cutoutInfo.bytes,
    },
    blinkEnabled: BLINK_ENABLED,
    rejectedSources: [
      {
        file: "gretel-wave.webp",
        reason: "Clothing mismatch — white tee + teal skirt, not orange stripes + blue overalls",
      },
    ],
    poses: {},
  };

  for (const [pose, files] of Object.entries(POSE_MAP)) {
    const dir = path.join(POSE_OUT, pose);
    await ensureDir(dir);
    const frames = [];
    for (let i = 0; i < files.length; i++) {
      const src = path.join(POSES_SRC, files[i]);
      if (!fs.existsSync(src)) {
        console.warn(`[skip missing] ${src}`);
        continue;
      }
      const out = path.join(dir, `frame-${i}.webp`);
      const info = await writeWebp(src, out, { width: 640, quality: 90 });
      frames.push({
        index: i,
        src: `/gretel/poses/${pose}/frame-${i}.webp`,
        sourceFile: files[i],
        width: info.width,
        height: info.height,
        bytes: info.bytes,
      });
    }
    manifest.poses[pose] = {
      frameCount: frames.length,
      frames,
      reducedMotionFallback: frames[0]?.src ?? null,
    };
  }

  // Also re-export talk frames for FSM talking state (under public/gretel/poses/talking/)
  const talkingFiles = ["gretel-talk-0.webp", "gretel-talk-1.webp", "gretel-talk-2.webp"];
  const talkDir = path.join(POSE_OUT, "talking");
  await ensureDir(talkDir);
  const talkFrames = [];
  for (let i = 0; i < talkingFiles.length; i++) {
    const src = path.join(POSES_SRC, talkingFiles[i]);
    if (!fs.existsSync(src)) continue;
    const out = path.join(talkDir, `frame-${i}.webp`);
    const info = await writeWebp(src, out, { width: 640, quality: 90 });
    talkFrames.push({
      index: i,
      src: `/gretel/poses/talking/frame-${i}.webp`,
      sourceFile: talkingFiles[i],
      width: info.width,
      height: info.height,
      bytes: info.bytes,
    });
  }
  manifest.poses.talking = {
    frameCount: talkFrames.length,
    frames: talkFrames,
    reducedMotionFallback: talkFrames[0]?.src ?? null,
  };

  // Blinking as dedicated pose folder for clarity
  const blinkDir = path.join(POSE_OUT, "blinking");
  await ensureDir(blinkDir);
  if (BLINK_ENABLED) {
    const info = await writeWebp(path.join(POSES_SRC, "gretel-blink.webp"), path.join(blinkDir, "frame-0.webp"), {
      width: 640,
      quality: 90,
    });
    manifest.poses.blinking = {
      frameCount: 1,
      frames: [
        {
          index: 0,
          src: "/gretel/poses/blinking/frame-0.webp",
          sourceFile: "gretel-blink.webp",
          width: info.width,
          height: info.height,
          bytes: info.bytes,
        },
      ],
      reducedMotionFallback: "/gretel/poses/idle/frame-0.webp",
    };
  }

  fs.writeFileSync(GEN_MANIFEST, JSON.stringify(manifest, null, 2));
  // Public copy for runtime if needed
  fs.writeFileSync(path.join(root, "public/gretel/poses-manifest.json"), JSON.stringify(manifest, null, 2));

  console.log(
    JSON.stringify(
      {
        ok: true,
        hero: { "1x": heroInfo1, "2x": heroInfo2 },
        poseCounts: Object.fromEntries(
          Object.entries(manifest.poses).map(([k, v]) => [k, v.frameCount]),
        ),
        blinkEnabled: BLINK_ENABLED,
        manifest: path.relative(root, GEN_MANIFEST),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
