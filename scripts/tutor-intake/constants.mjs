import { homedir } from "node:os";
import { join } from "node:path";

export const SUPPORTED_AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".m4a"]);
export const SUPPORTED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".avi",
  ".m4v",
]);
export const SUPPORTED_MEDIA_EXTENSIONS = new Set([
  ...SUPPORTED_AUDIO_EXTENSIONS,
  ...SUPPORTED_VIDEO_EXTENSIONS,
]);

export const DEFAULT_PRIVATE_VOICE_DIR =
  process.env.GRETEL_VOICE_PRIVATE_DIR || join(homedir(), "GretelVoicePrivate");

/**
 * Owner-approved original master recording SHA-256 (adopted from PR #1323).
 */
export const APPROVED_ORIGINAL_MASTER_SHA256 =
  "239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d";

/**
 * Permanently rejected SHA-256 digests (owner governance):
 * - nina-sordita.mp3 (retired 2026-10-22; replaced by "niña distraída")
 */
export const REJECTED_SHA256S = new Set([
  "40400ef648db825bf5da6b732db97bc66b097192f3f6288b7bdb44d6788bbc91",
]);

/**
 * Permanently rejected file/path patterns (owner governance):
 * - 67-clip ZIP (Gretel_67_Audio_Lecciones_Listo.zip) and rec_gretel_* clips
 * - nina-sordita.mp3 / niña sordita
 * - TinyWow third-party compromised recording
 */
export const REJECTED_PATH_PATTERNS = [
  /rec_gretel_/i,
  /Gretel_67/i,
  /67_Audio/i,
  /Audio_Lecciones_Listo/i,
  /nina[-_ ]?sordita/i,
  /niña[-_ ]?sordita/i,
  /tinywow/i,
];

/** Transcript patterns that must never enter active tutor lines. */
export const REJECTED_TRANSCRIPT_PATTERNS = [/\bsordita\b/i];

/** Required .gitignore entries so private voice originals are never committed. */
export const REQUIRED_GITIGNORE_ENTRIES = [
  "GretelVoicePrivate/",
  ".gretel-voice-private/",
  "public/audio/private/",
];

/** Rhubarb settings pinned to spec §6. */
export const RHUBARB_VERSION = "1.14.0";
export const RHUBARB_RECOGNIZER = "phonetic";
export const RHUBARB_EXTENDED_SHAPES = "GX";
export const ALLOWED_MOUTH_SHAPES = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];
export const ALLOWED_MOUTH_SHAPE_SET = new Set(ALLOWED_MOUTH_SHAPES);

/** Runtime MP3 profile matching existing owner-approved vocabulario clips. */
export const RUNTIME_MP3_SAMPLE_RATE = 24000;
export const RUNTIME_MP3_BITRATE = "48k";
export const RUNTIME_MP3_CHANNELS = 1;
export const ANALYSIS_WAV_SAMPLE_RATE = 16000;
export const VISEME_WAV_SAMPLE_RATE = 44100;
