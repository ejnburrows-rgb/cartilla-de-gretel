import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { delimiter, dirname, extname, join, resolve } from "node:path";
import {
  ANALYSIS_WAV_SAMPLE_RATE,
  RUNTIME_MP3_BITRATE,
  RUNTIME_MP3_CHANNELS,
  RUNTIME_MP3_SAMPLE_RATE,
} from "./constants.mjs";

function findInDirTree(dirPath, targetNames, maxDepth = 3) {
  if (!existsSync(dirPath) || maxDepth < 0) return null;
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && targetNames.includes(entry.name)) {
      return join(dirPath, entry.name);
    }
  }
  if (maxDepth === 0) return null;
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findInDirTree(join(dirPath, entry.name), targetNames, maxDepth - 1);
      if (found) return found;
    }
  }
  return null;
}

function findOnPath(binaryName) {
  const pathEnv = process.env.PATH || "";
  const candidates =
    process.platform === "win32" ? [`${binaryName}.exe`, binaryName] : [binaryName];
  for (const dir of pathEnv.split(delimiter).filter(Boolean)) {
    for (const candidate of candidates) {
      const full = join(dir, candidate);
      if (existsSync(full)) return full;
    }
  }
  return null;
}

/**
 * Resolve an external binary (`ffmpeg`, `ffprobe`, `rhubarb`) from:
 * 1. Explicit path override, 2. environment variable, 3. `<repoRoot>/.tools/`, 4. system PATH.
 */
export function resolveToolBinary(name, { repoRoot, explicitPath, envVar } = {}) {
  if (explicitPath && existsSync(explicitPath)) return resolve(explicitPath);
  if (envVar && process.env[envVar] && existsSync(process.env[envVar])) {
    return resolve(process.env[envVar]);
  }
  const names = process.platform === "win32" ? [`${name}.exe`, name] : [name];
  if (repoRoot) {
    const toolsDir = join(repoRoot, ".tools");
    const inTools = findInDirTree(toolsDir, names, 3);
    if (inTools) return inTools;
  }
  return findOnPath(name);
}

/** Discover ffmpeg, ffprobe, and rhubarb binaries available to the pipeline. */
export function resolveMediaTools({ repoRoot, ffmpegPath, ffprobePath, rhubarbPath } = {}) {
  return {
    ffmpeg: resolveToolBinary("ffmpeg", {
      repoRoot,
      explicitPath: ffmpegPath,
      envVar: "FFMPEG_PATH",
    }),
    ffprobe: resolveToolBinary("ffprobe", {
      repoRoot,
      explicitPath: ffprobePath,
      envVar: "FFPROBE_PATH",
    }),
    rhubarb: resolveToolBinary("rhubarb", {
      repoRoot,
      explicitPath: rhubarbPath,
      envVar: "RHUBARB_PATH",
    }),
  };
}

/** Parse a RIFF/WAVE PCM16 buffer into mono Int16Array samples + metadata. */
export function parseWavBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 44) {
    throw new Error("Invalid WAV buffer: too short");
  }
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Invalid WAV header: expected RIFF/WAVE");
  }

  let offset = 12;
  let audioFormat = null;
  let channels = null;
  let sampleRate = null;
  let bitsPerSample = null;
  let dataOffset = null;
  let dataSize = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const bodyStart = offset + 8;
    if (chunkId === "fmt ") {
      audioFormat = buffer.readUInt16LE(bodyStart);
      channels = buffer.readUInt16LE(bodyStart + 2);
      sampleRate = buffer.readUInt32LE(bodyStart + 4);
      bitsPerSample = buffer.readUInt16LE(bodyStart + 14);
    } else if (chunkId === "data") {
      dataOffset = bodyStart;
      dataSize = Math.min(chunkSize, buffer.length - bodyStart);
      break;
    }
    offset = bodyStart + chunkSize + (chunkSize % 2);
  }

  if (
    audioFormat !== 1 ||
    bitsPerSample !== 16 ||
    dataOffset === null ||
    !channels ||
    !sampleRate
  ) {
    throw new Error(
      `Unsupported WAV format (audioFormat=${audioFormat}, bits=${bitsPerSample}, channels=${channels}, sampleRate=${sampleRate})`,
    );
  }

  const frameCount = Math.floor(dataSize / (2 * channels));
  const mono = new Int16Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    if (channels === 1) {
      mono[i] = buffer.readInt16LE(dataOffset + i * 2);
    } else {
      let sum = 0;
      for (let ch = 0; ch < channels; ch++) {
        sum += buffer.readInt16LE(dataOffset + (i * channels + ch) * 2);
      }
      mono[i] = Math.round(sum / channels);
    }
  }

  return {
    sampleRate,
    channels,
    bitsPerSample,
    durationSec: frameCount / sampleRate,
    samples: mono,
  };
}

/** Encode mono Int16Array samples as a standard PCM16 RIFF/WAVE buffer. */
export function encodeWavPcm16(samples, sampleRate = ANALYSIS_WAV_SAMPLE_RATE) {
  const dataLength = samples.length * 2;
  const buf = Buffer.alloc(44 + dataLength);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(36 + dataLength, 4);
  buf.write("WAVE", 8, "ascii");
  buf.write("fmt ", 12, "ascii");
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36, "ascii");
  buf.writeUInt32LE(dataLength, 40);
  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i]))), 44 + i * 2);
  }
  return buf;
}

/** Linear-interpolation resampler for Int16Array mono audio when ffmpeg is absent. */
export function resampleMonoPcm16(samples, fromRate, toRate) {
  if (fromRate === toRate) return new Int16Array(samples);
  const outLength = Math.max(1, Math.round((samples.length * toRate) / fromRate));
  const out = new Int16Array(outLength);
  const ratio = fromRate / toRate;
  for (let i = 0; i < outLength; i++) {
    const srcPos = i * ratio;
    const idx = Math.floor(srcPos);
    const frac = srcPos - idx;
    const s0 = samples[idx] ?? 0;
    const s1 = samples[Math.min(idx + 1, samples.length - 1)] ?? s0;
    out[i] = Math.round(s0 + (s1 - s0) * frac);
  }
  return out;
}

const MPEG1_L3_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const MPEG2_L3_BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
const MPEG1_RATES = [44100, 48000, 32000, 0];
const MPEG2_RATES = [22050, 24000, 16000, 0];
const MPEG25_RATES = [11025, 12000, 8000, 0];

/** Pure-JS MP3 frame-header scanner for duration/rate/bitrate when ffprobe is unavailable. */
export function inspectMp3Buffer(buffer) {
  let offset = 0;
  if (buffer.length >= 10 && buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    const tagSize =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);
    offset = 10 + tagSize;
  }

  let frames = 0;
  let totalDuration = 0;
  let detectedRate = null;
  let detectedBitrate = null;
  let detectedChannels = null;

  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff || (buffer[offset + 1] & 0xe0) !== 0xe0) {
      offset += 1;
      continue;
    }
    const b1 = buffer[offset + 1];
    const b2 = buffer[offset + 2];
    const b3 = buffer[offset + 3];
    const versionBits = (b1 >> 3) & 0x03; // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    const layerBits = (b1 >> 1) & 0x03; // 1=Layer III
    const bitrateIndex = (b2 >> 4) & 0x0f;
    const rateIndex = (b2 >> 2) & 0x03;
    const padding = (b2 >> 1) & 0x01;
    const channelMode = (b3 >> 6) & 0x03;

    if (
      versionBits === 1 ||
      layerBits !== 1 ||
      bitrateIndex === 0 ||
      bitrateIndex === 15 ||
      rateIndex === 3
    ) {
      offset += 1;
      continue;
    }

    const sampleRate =
      versionBits === 3
        ? MPEG1_RATES[rateIndex]
        : versionBits === 2
          ? MPEG2_RATES[rateIndex]
          : MPEG25_RATES[rateIndex];
    const bitrateKbps =
      versionBits === 3 ? MPEG1_L3_BITRATES[bitrateIndex] : MPEG2_L3_BITRATES[bitrateIndex];
    const samplesPerFrame = versionBits === 3 ? 1152 : 576;
    const frameLength =
      Math.floor(((samplesPerFrame / 8) * bitrateKbps * 1000) / sampleRate) + padding;
    if (frameLength <= 4 || offset + frameLength > buffer.length) break;

    if (frames === 0) {
      detectedRate = sampleRate;
      detectedBitrate = bitrateKbps;
      detectedChannels = channelMode === 3 ? 1 : 2;
      // Check Xing / Info VBR header inside the first frame; don't double-count metadata frame
      const frameSlice = buffer.subarray(offset, offset + frameLength);
      if (frameSlice.includes("Xing") || frameSlice.includes("Info")) {
        offset += frameLength;
        continue;
      }
    }

    frames += 1;
    totalDuration += samplesPerFrame / sampleRate;
    offset += frameLength;
  }

  return {
    codec: "mp3",
    frames,
    sampleRate: detectedRate,
    bitrateKbps: detectedBitrate,
    channels: detectedChannels,
    durationSec: totalDuration,
  };
}

/** Probe audio/video duration & stream metadata using ffprobe or pure-JS fallback. */
export function probeMedia(inputPath, { tools } = {}) {
  const ffprobe = tools?.ffprobe;
  if (ffprobe) {
    const out = execFileSync(
      ffprobe,
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=codec_type,codec_name,sample_rate,channels,bit_rate",
        "-of",
        "json",
        inputPath,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    const parsed = JSON.parse(out);
    const audioStream = (parsed.streams ?? []).find((s) => s.codec_type === "audio") ?? {};
    const videoStream = (parsed.streams ?? []).find((s) => s.codec_type === "video");
    return {
      durationSec: Number(parsed.format?.duration ?? 0),
      sampleRate: audioStream.sample_rate ? Number(audioStream.sample_rate) : null,
      channels: audioStream.channels ? Number(audioStream.channels) : null,
      codec: audioStream.codec_name ?? null,
      hasVideo: Boolean(videoStream),
      probedBy: "ffprobe",
    };
  }

  const ext = extname(inputPath).toLowerCase();
  const buf = readFileSync(inputPath);
  if (ext === ".wav") {
    const wav = parseWavBuffer(buf);
    return {
      durationSec: wav.durationSec,
      sampleRate: wav.sampleRate,
      channels: wav.channels,
      codec: "pcm_s16le",
      hasVideo: false,
      probedBy: "js-wav",
    };
  }
  if (ext === ".mp3") {
    const mp3 = inspectMp3Buffer(buf);
    return {
      durationSec: mp3.durationSec,
      sampleRate: mp3.sampleRate,
      channels: mp3.channels,
      codec: "mp3",
      hasVideo: false,
      probedBy: "js-mp3",
    };
  }

  throw new Error(`Cannot probe ${ext} without ffprobe installed (checked PATH and .tools/)`);
}

/**
 * Extract audio from MP3/WAV/M4A/video and resample to mono PCM16 WAV via ffmpeg
 * (or pure-JS WAV path when input is already .wav and ffmpeg is absent).
 */
export function extractAndResampleWav({
  inputPath,
  outputWavPath,
  sampleRate = ANALYSIS_WAV_SAMPLE_RATE,
  channels = 1,
  startSec,
  endSec,
  tools,
}) {
  mkdirSync(dirname(outputWavPath), { recursive: true });
  const ffmpeg = tools?.ffmpeg;
  if (ffmpeg) {
    const args = ["-hide_banner", "-loglevel", "error", "-y"];
    if (typeof startSec === "number" && startSec > 0) {
      args.push("-ss", startSec.toFixed(4));
    }
    if (typeof endSec === "number" && endSec > 0) {
      args.push("-to", endSec.toFixed(4));
    }
    args.push(
      "-i",
      inputPath,
      "-vn",
      "-ac",
      String(channels),
      "-ar",
      String(sampleRate),
      "-c:a",
      "pcm_s16le",
      outputWavPath,
    );
    execFileSync(ffmpeg, args, { stdio: "pipe" });
    return { outputWavPath, engine: "ffmpeg", sampleRate, channels };
  }

  if (extname(inputPath).toLowerCase() === ".wav") {
    const parsed = parseWavBuffer(readFileSync(inputPath));
    let slice = parsed.samples;
    const sIdx =
      typeof startSec === "number" ? Math.max(0, Math.floor(startSec * parsed.sampleRate)) : 0;
    const eIdx =
      typeof endSec === "number"
        ? Math.min(slice.length, Math.ceil(endSec * parsed.sampleRate))
        : slice.length;
    slice = slice.subarray(sIdx, eIdx);
    const resampled = resampleMonoPcm16(slice, parsed.sampleRate, sampleRate);
    writeFileSync(outputWavPath, encodeWavPcm16(resampled, sampleRate));
    return { outputWavPath, engine: "js-wav", sampleRate, channels: 1 };
  }

  throw new Error(
    `ffmpeg is required to extract/resample "${inputPath}" (install ffmpeg or place it in .tools/)`,
  );
}

/**
 * Export a runtime-ready MP3 clip without altering speech timing or pitch.
 * Applies optional gentle edge fades only when slicing from a longer batch.
 */
export function exportRuntimeMp3({
  inputPath,
  outputMp3Path,
  startSec,
  endSec,
  fadeInMs = 15,
  fadeOutMs = 25,
  sampleRate = RUNTIME_MP3_SAMPLE_RATE,
  bitrate = RUNTIME_MP3_BITRATE,
  channels = RUNTIME_MP3_CHANNELS,
  tools,
}) {
  const ffmpeg = tools?.ffmpeg;
  if (!ffmpeg) {
    throw new Error(
      `ffmpeg is required to export runtime MP3 "${outputMp3Path}" (install ffmpeg or place it in .tools/)`,
    );
  }
  mkdirSync(dirname(outputMp3Path), { recursive: true });

  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  const isSliced = typeof startSec === "number" && typeof endSec === "number";
  if (isSliced) {
    args.push("-ss", Math.max(0, startSec).toFixed(4), "-to", endSec.toFixed(4));
  }
  args.push("-i", inputPath, "-vn");

  if (isSliced && (fadeInMs > 0 || fadeOutMs > 0)) {
    const dur = Math.max(0.05, endSec - Math.max(0, startSec));
    const filters = [];
    if (fadeInMs > 0) {
      filters.push(`afade=t=in:st=0:d=${Math.min(fadeInMs / 1000, dur / 3).toFixed(4)}`);
    }
    if (fadeOutMs > 0) {
      const fadeDur = Math.min(fadeOutMs / 1000, dur / 3);
      const fadeStart = Math.max(0, dur - fadeDur);
      filters.push(`afade=t=out:st=${fadeStart.toFixed(4)}:d=${fadeDur.toFixed(4)}`);
    }
    if (filters.length > 0) {
      args.push("-af", filters.join(","));
    }
  }

  args.push(
    "-ac",
    String(channels),
    "-ar",
    String(sampleRate),
    "-b:a",
    bitrate,
    "-c:a",
    "libmp3lame",
    outputMp3Path,
  );
  execFileSync(ffmpeg, args, { stdio: "pipe" });
  return { outputMp3Path, sampleRate, bitrate, channels };
}
