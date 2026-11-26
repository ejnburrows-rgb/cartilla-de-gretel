import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { tokenizeSpanish } from "./alignment.mjs";
import { resolveFixedSystemBinary } from "./media.mjs";

/**
 * Local offline Python Vosk recognizer snippet (adopted from PR #1323).
 * Invoked only via a fixed-path `python3` binary with `--vosk-model <path>`.
 * Never downloads anything or accesses the network; reports unavailable cleanly if `vosk` is absent.
 */
const VOSK_RECOGNIZE_SCRIPT = `
import json, sys, wave
try:
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1)
except ImportError:
    print(json.dumps({"available": False, "status": "local alignment model unavailable", "reason": "python vosk package not installed"}))
    sys.exit(0)

model_path = sys.argv[1]
wav_path = sys.argv[2]
model = Model(model_path)
rec = KaldiRecognizer(model, 16000)
rec.SetWords(True)
words = []
with wave.open(wav_path, "rb") as f:
    while True:
        chunk = f.readframes(8000)
        if not chunk:
            break
        if rec.AcceptWaveform(chunk):
            words.extend(json.loads(rec.Result()).get("result", []))
words.extend(json.loads(rec.FinalResult()).get("result", []))
print(json.dumps({"available": True, "status": "ok", "words": words}))
`;

/**
 * Align Vosk word-level timestamps against expected script lines using PR #1323's
 * gap (>= 0.25s) and confidence (>= 0.85) rules.
 */
export function alignVoskWordsToLines(
  words,
  expectedLines = [],
  durationSec = 0,
  { minGapSec = 0.25, minConfidence = 0.85 } = {},
) {
  const byFirst = new Map();
  for (const row of expectedLines) {
    const phrase = tokenizeSpanish(row?.text ?? "", { foldAccents: false });
    if (phrase.length === 0) continue;
    const first = phrase[0];
    if (!byFirst.has(first)) byFirst.set(first, []);
    byFirst.get(first).push({ phrase, row });
  }

  const heard = words.map((w) => String(w?.word ?? "").normalize("NFC").toLowerCase());
  const findings = [];
  const segments = [];
  let cursor = 0;

  while (cursor < words.length) {
    const list = byFirst.get(heard[cursor]) ?? [];
    const candidates = list.filter(({ phrase }) => {
      if (cursor + phrase.length > heard.length) return false;
      for (let k = 0; k < phrase.length; k++) {
        if (heard[cursor + k] !== phrase[k]) return false;
      }
      return true;
    });

    if (candidates.length !== 1) {
      findings.push({
        status: candidates.length > 1 ? "ambiguous" : "unmatched",
        ...words[cursor],
      });
      cursor += 1;
      continue;
    }

    const { phrase, row } = candidates[0];
    const end = cursor + phrase.length;
    const startTime = Number(words[cursor]?.start ?? 0);
    const lastTime = Number(words[end - 1]?.end ?? startTime);
    const previousEnd = cursor > 0 ? Number(words[cursor - 1]?.end ?? 0) : 0;
    const followingStart = end < words.length ? Number(words[end]?.start ?? durationSec) : durationSec;

    const gapsOk =
      (cursor === 0 || startTime - previousEnd >= minGapSec) &&
      (end === words.length || followingStart - lastTime >= minGapSec);
    const confident = words
      .slice(cursor, end)
      .every((w) => Number(w?.conf ?? 0) >= minConfidence);

    const cutStart = cursor === 0 ? 0 : (previousEnd + startTime) / 2;
    const cutEnd = end === words.length ? durationSec : (followingStart + lastTime) / 2;
    const lineId = row.id ?? row.lineId ?? row.recordingId ?? null;
    const status = gapsOk && confident ? "candidate" : "review boundaries or transcript";

    findings.push({
      lineId,
      recordingId: row.recordingId ?? lineId,
      batch: row.batch ?? null,
      sequence: row.seq ?? row.sequence ?? null,
      text: row.text,
      start: Number(cutStart.toFixed(4)),
      end: Number(cutEnd.toFixed(4)),
      status,
      musicNoiseStutter: "requires listening review",
    });

    segments.push({
      startSec: Number(cutStart.toFixed(4)),
      endSec: Number(cutEnd.toFixed(4)),
      text: words
        .slice(cursor, end)
        .map((w) => w.word)
        .join(" "),
      lineIdHint: lineId,
      voskStatus: status,
    });

    cursor = end;
  }

  return { findings, segments };
}

/**
 * Optional local offline Vosk word-alignment hook (adopted from PR #1323).
 * Invokes fixed-path `python3` with `vosk` if installed; cleanly reports
 * `"local alignment model unavailable"` if the model path, python3, or `vosk` is absent.
 */
export function runVoskWordAlignment({
  wavPath,
  modelPath,
  expectedLines = [],
  durationSec = 0,
  repoRoot,
  pythonPath = null,
  voskRunner = null,
} = {}) {
  if (!modelPath) {
    return {
      available: false,
      status: "local alignment model unavailable",
      reason: "no --vosk-model path provided",
      words: [],
      findings: [],
      segments: [],
    };
  }

  const absModelPath = resolve(modelPath);
  if (!existsSync(absModelPath)) {
    return {
      available: false,
      status: "local alignment model unavailable",
      reason: `Vosk model directory not found: ${absModelPath}`,
      words: [],
      findings: [],
      segments: [],
    };
  }

  let recognition;
  if (typeof voskRunner === "function") {
    recognition = voskRunner({ wavPath: resolve(wavPath), modelPath: absModelPath });
  } else {
    const pythonBin = pythonPath ?? resolveFixedSystemBinary("python3", { repoRoot });
    if (!pythonBin) {
      return {
        available: false,
        status: "local alignment model unavailable",
        reason: "python3 binary not found in fixed system paths",
        words: [],
        findings: [],
        segments: [],
      };
    }

    const res = spawnSync(pythonBin, ["-c", VOSK_RECOGNIZE_SCRIPT, absModelPath, resolve(wavPath)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (res.status !== 0) {
      return {
        available: false,
        status: "local alignment model unavailable",
        reason: (res.stderr || res.error?.message || "python3 vosk execution failed").trim(),
        words: [],
        findings: [],
        segments: [],
      };
    }
    try {
      recognition = JSON.parse((res.stdout || "").trim());
    } catch {
      return {
        available: false,
        status: "local alignment model unavailable",
        reason: "unparseable output from python3 vosk recognizer",
        words: [],
        findings: [],
        segments: [],
      };
    }
  }

  if (!recognition?.available) {
    return {
      available: false,
      status: "local alignment model unavailable",
      reason: recognition?.reason ?? "python vosk package not installed",
      words: [],
      findings: [],
      segments: [],
    };
  }

  const words = Array.isArray(recognition.words) ? recognition.words : [];
  const { findings, segments } = alignVoskWordsToLines(words, expectedLines, durationSec);
  return {
    available: true,
    status: "aligned",
    reason: null,
    words,
    findings,
    segments,
  };
}
